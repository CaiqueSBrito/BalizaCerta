import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Review {
  id: string;
  instructor_id: string;
  student_id: string;
  rating: number;
  comment: string;
  created_at: string;
  student_name?: string;
}

export const useReviews = (instructorId: string) => {
  return useQuery({
    queryKey: ['reviews', instructorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          instructor_id,
          student_id,
          rating,
          comment,
          created_at,
          profiles:student_id (first_name, last_name)
        `)
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      // Map to include student name
      return (data || []).map((review: any) => ({
        id: review.id,
        instructor_id: review.instructor_id,
        student_id: review.student_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        student_name: review.profiles 
          ? `${review.profiles.first_name || ''} ${review.profiles.last_name?.charAt(0) || ''}.`.trim()
          : 'Aluno',
      })) as Review[];
    },
    enabled: !!instructorId,
  });
};

export const useCanReview = (instructorId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['can-review', instructorId, user?.id],
    queryFn: async () => {
      if (!user) return { canReview: false, reason: 'not_logged_in' };

      const { data, error } = await supabase.rpc('can_student_review_instructor', {
        p_instructor_id: instructorId
      });

      if (error) {
        console.error('Error checking review eligibility:', error);
        return { canReview: false, reason: 'error' };
      }

      if (data === true) {
        return { canReview: true, reason: null };
      }

      // Check specific reason why user can't review
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (profile?.user_type !== 'student') {
        return { canReview: false, reason: 'not_student' };
      }

      // Check if already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('instructor_id', instructorId)
        .eq('student_id', user.id)
        .single();

      if (existingReview) {
        return { canReview: false, reason: 'already_reviewed' };
      }

      // Must be no completed lessons
      return { canReview: false, reason: 'no_completed_lessons' };
    },
    enabled: !!instructorId && !!user,
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      instructorId, 
      rating, 
      comment 
    }: { 
      instructorId: string; 
      rating: number; 
      comment: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          instructor_id: instructorId,
          student_id: user.id,
          rating,
          comment,
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting review:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      toast.success('Avaliação enviada com sucesso!');
      // Invalidate reviews and instructor data to refresh rating
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.instructorId] });
      queryClient.invalidateQueries({ queryKey: ['instructor', variables.instructorId] });
      queryClient.invalidateQueries({ queryKey: ['can-review', variables.instructorId] });
    },
    onError: (error: any) => {
      console.error('Error submitting review:', error);
      if (error.message?.includes('row-level security')) {
        toast.error('Você não tem permissão para avaliar este instrutor.');
      } else {
        toast.error('Erro ao enviar avaliação. Tente novamente.');
      }
    },
  });
};
