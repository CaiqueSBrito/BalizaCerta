import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Instructor {
  id: string;
  profile_id: string;
  bio: string | null;
  price_per_hour: number;
  cnh_category: string[];
  cnh_years: number;
  has_vehicle: boolean;
  plan: 'free' | 'pro';
  city: string | null;
  state: string | null;
  rating: number;
  review_count: number;
  specialties: string[];
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    user_type: string;
    avatar_url: string | null;
    phone: string | null;
  };
}

export const useInstructors = (limit?: number) => {
  return useQuery({
    queryKey: ['instructors', limit],
    queryFn: async () => {
      let query = supabase
        .from('instructors')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            user_type,
            avatar_url,
            phone
          )
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching instructors:', error);
        throw error;
      }
      
      return data as Instructor[];
    },
  });
};

export const useInstructor = (id: string) => {
  return useQuery({
    queryKey: ['instructor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instructors')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            user_type,
            avatar_url,
            phone
          )
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching instructor:', error);
        throw error;
      }
      
      return data as Instructor | null;
    },
    enabled: !!id,
  });
};
