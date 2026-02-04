import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  user_type: 'student' | 'instructor';
  created_at: string;
  // Instructor specific
  instructor_id?: string;
  plan?: 'free' | 'pro';
  is_active?: boolean;
  city?: string;
  state?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: string;
  subscription_end_date?: string;
}

export interface AdminLesson {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  created_at: string;
  instructor_name: string;
  instructor_id: string;
  student_name: string;
  student_id: string;
}

export interface AdminMetrics {
  totalInstructors: number;
  totalStudents: number;
  totalProInstructors: number;
  completedLessonsThisMonth: number;
  pendingLessons: number;
  estimatedRevenue: number;
}

export const useAdminCheck = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .rpc('is_admin', { _user_id: user.id });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data === true;
    },
    enabled: !!user,
  });
};

export const useAdminUsers = (filters: {
  userType?: 'student' | 'instructor' | 'all';
  subscriptionStatus?: 'free' | 'pro' | 'all';
  city?: string;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      // First get all profiles
      let profilesQuery = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.userType && filters.userType !== 'all') {
        profilesQuery = profilesQuery.eq('user_type', filters.userType);
      }
      
      const { data: profiles, error: profilesError } = await profilesQuery;
      
      if (profilesError) throw profilesError;
      
      // Get all instructors for additional data
      const { data: instructors, error: instructorsError } = await supabase
        .from('instructors')
        .select('*');
      
      if (instructorsError) throw instructorsError;
      
      // Merge the data
      const users: AdminUser[] = (profiles || []).map(profile => {
        const instructor = instructors?.find(i => i.profile_id === profile.id);
        
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          user_type: profile.user_type,
          created_at: profile.created_at,
          instructor_id: instructor?.id,
          plan: instructor?.plan,
          is_active: instructor?.is_active ?? true,
          city: instructor?.city,
          state: instructor?.state,
          stripe_customer_id: instructor?.stripe_customer_id,
          stripe_subscription_id: instructor?.stripe_subscription_id,
          subscription_status: instructor?.subscription_status,
          subscription_end_date: instructor?.subscription_end_date,
        };
      });
      
      // Apply subscription filter
      let filteredUsers = users;
      if (filters.subscriptionStatus && filters.subscriptionStatus !== 'all') {
        filteredUsers = users.filter(u => {
          if (u.user_type === 'student') return filters.subscriptionStatus === 'free';
          return u.plan === filters.subscriptionStatus;
        });
      }
      
      // Apply city filter
      if (filters.city) {
        filteredUsers = filteredUsers.filter(u => 
          u.city?.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }
      
      return filteredUsers;
    },
    enabled: !!user,
  });
};

export const useAdminLessons = (filters: {
  status?: string;
  instructorId?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-lessons', filters],
    queryFn: async () => {
      // Get lessons with instructor and student info
      let query = supabase
        .from('lessons')
        .select('*')
        .order('scheduled_date', { ascending: false });
      
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.instructorId) {
        query = query.eq('instructor_id', filters.instructorId);
      }
      
      if (filters.dateFrom) {
        query = query.gte('scheduled_date', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('scheduled_date', filters.dateTo);
      }
      
      const { data: lessons, error } = await query;
      if (error) throw error;
      
      // Get all profiles for names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name');
      
      // Get instructors to map instructor_id to profile_id
      const { data: instructors } = await supabase
        .from('instructors')
        .select('id, profile_id');
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      const instructorProfileMap = new Map(instructors?.map(i => [i.id, i.profile_id]) || []);
      
      const enrichedLessons: AdminLesson[] = (lessons || []).map(lesson => {
        const instructorProfileId = instructorProfileMap.get(lesson.instructor_id);
        return {
          id: lesson.id,
          scheduled_date: lesson.scheduled_date,
          scheduled_time: lesson.scheduled_time,
          duration_minutes: lesson.duration_minutes,
          status: lesson.status,
          notes: lesson.notes,
          created_at: lesson.created_at,
          instructor_id: lesson.instructor_id,
          instructor_name: instructorProfileId ? profileMap.get(instructorProfileId) || 'Desconhecido' : 'Desconhecido',
          student_id: lesson.student_id,
          student_name: profileMap.get(lesson.student_id) || 'Desconhecido',
        };
      });
      
      return enrichedLessons;
    },
    enabled: !!user,
  });
};

export const useAdminMetrics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      // Get counts
      const { count: instructorCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'instructor');
      
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'student');
      
      const { count: proCount } = await supabase
        .from('instructors')
        .select('*', { count: 'exact', head: true })
        .eq('plan', 'pro');
      
      // Get lessons this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: completedThisMonth } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('scheduled_date', startOfMonth.toISOString().split('T')[0]);
      
      const { count: pendingLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      // Estimate revenue (Pro subscribers * R$49.90)
      const estimatedRevenue = (proCount || 0) * 49.90;
      
      return {
        totalInstructors: instructorCount || 0,
        totalStudents: studentCount || 0,
        totalProInstructors: proCount || 0,
        completedLessonsThisMonth: completedThisMonth || 0,
        pendingLessons: pendingLessons || 0,
        estimatedRevenue,
      } as AdminMetrics;
    },
    enabled: !!user,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ instructorId, isActive }: { instructorId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('instructors')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', instructorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Status do usuário atualizado');
    },
    onError: (error) => {
      console.error('Error updating user status:', error);
      toast.error('Erro ao atualizar status');
    },
  });
};

export const useUpdateInstructorPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ instructorId, plan }: { instructorId: string; plan: 'free' | 'pro' }) => {
      const updateData: Record<string, unknown> = {
        plan,
        updated_at: new Date().toISOString(),
      };
      
      if (plan === 'pro') {
        updateData.subscription_status = 'active';
        // Set end date to 1 year from now for manual upgrades
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        updateData.subscription_end_date = endDate.toISOString();
      } else {
        updateData.subscription_status = 'inactive';
        updateData.subscription_end_date = null;
      }
      
      const { error } = await supabase
        .from('instructors')
        .update(updateData)
        .eq('id', instructorId);
      
      if (error) throw error;
    },
    onSuccess: (_, { plan }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      toast.success(plan === 'pro' ? 'Usuário promovido a Pro!' : 'Plano revertido para Free');
    },
    onError: (error) => {
      console.error('Error updating plan:', error);
      toast.error('Erro ao atualizar plano');
    },
  });
};

export const useUpdateLessonStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lessonId, status }: { lessonId: string; status: string }) => {
      const { error } = await supabase
        .from('lessons')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', lessonId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      toast.success('Status da aula atualizado');
    },
    onError: (error) => {
      console.error('Error updating lesson status:', error);
      toast.error('Erro ao atualizar status da aula');
    },
  });
};

export const useExportLessons = () => {
  return useMutation({
    mutationFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('status', 'completed')
        .gte('scheduled_date', startOfMonth.toISOString().split('T')[0]);
      
      if (error) throw error;
      
      // Get profiles and instructors for names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name');
      
      const { data: instructors } = await supabase
        .from('instructors')
        .select('id, profile_id');
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      const instructorProfileMap = new Map(instructors?.map(i => [i.id, i.profile_id]) || []);
      
      // Create CSV
      const headers = ['Data', 'Horário', 'Duração (min)', 'Instrutor', 'Aluno', 'Status'];
      const rows = (lessons || []).map(lesson => {
        const instructorProfileId = instructorProfileMap.get(lesson.instructor_id);
        return [
          lesson.scheduled_date,
          lesson.scheduled_time,
          lesson.duration_minutes,
          instructorProfileId ? profileMap.get(instructorProfileId) || '' : '',
          profileMap.get(lesson.student_id) || '',
          lesson.status,
        ].join(',');
      });
      
      const csv = [headers.join(','), ...rows].join('\n');
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `aulas-concluidas-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      return lessons?.length || 0;
    },
    onSuccess: (count) => {
      toast.success(`Relatório exportado com ${count} aulas`);
    },
    onError: (error) => {
      console.error('Error exporting lessons:', error);
      toast.error('Erro ao exportar relatório');
    },
  });
};
