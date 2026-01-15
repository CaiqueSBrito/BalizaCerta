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
  detran_certificate: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string;
    email: string;
    user_type: string;
    avatar_url: string | null;
    phone: string | null;
    whatsapp: string | null;
    // CPF não é retornado por segurança
  };
}

export const useInstructors = (limit?: number) => {
  return useQuery({
    queryKey: ['instructors', limit],
    queryFn: async () => {
      let query = supabase
        .from('instructors')
        .select(`
          id,
          profile_id,
          bio,
          price_per_hour,
          cnh_category,
          cnh_years,
          has_vehicle,
          plan,
          city,
          state,
          rating,
          review_count,
          specialties,
          is_verified,
          is_active,
          created_at,
          profiles (
            id,
            first_name,
            last_name,
            full_name,
            user_type,
            avatar_url,
            whatsapp
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
          id,
          profile_id,
          bio,
          price_per_hour,
          cnh_category,
          cnh_years,
          has_vehicle,
          plan,
          city,
          state,
          rating,
          review_count,
          specialties,
          is_verified,
          is_active,
          detran_certificate,
          created_at,
          profiles (
            id,
            first_name,
            last_name,
            full_name,
            user_type,
            avatar_url,
            whatsapp
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
