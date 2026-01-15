import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InstructorPublic {
  id: string;
  profile_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
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
  whatsapp_masked: string;
  detran_certificate?: string | null;
}

export const useInstructors = (limit?: number) => {
  return useQuery({
    queryKey: ['instructors', limit],
    queryFn: async () => {
      // Use secure RPC function that returns only public data with masked WhatsApp
      const { data, error } = await supabase.rpc('get_instructors_public', {
        p_is_active: true
      });
      
      if (error) {
        console.error('Error fetching instructors:', error);
        throw error;
      }
      
      // Sort by rating and apply limit
      let sortedData = (data as InstructorPublic[]).sort((a, b) => b.rating - a.rating);
      
      if (limit) {
        sortedData = sortedData.slice(0, limit);
      }

      return sortedData;
    },
  });
};

export const useInstructor = (id: string) => {
  return useQuery({
    queryKey: ['instructor', id],
    queryFn: async () => {
      // Use secure RPC function for single instructor
      const { data, error } = await supabase.rpc('get_instructor_by_id', {
        p_instructor_id: id
      });
      
      if (error) {
        console.error('Error fetching instructor:', error);
        throw error;
      }
      
      // RPC returns an array, get first item
      const instructors = data as InstructorPublic[];
      return instructors.length > 0 ? instructors[0] : null;
    },
    enabled: !!id,
  });
};

// Function to get WhatsApp for contact (only returns for active instructors)
export const getInstructorWhatsApp = async (instructorId: string): Promise<string | null> => {
  const { data, error } = await supabase.rpc('get_instructor_whatsapp', {
    p_instructor_id: instructorId
  });
  
  if (error) {
    console.error('Error fetching instructor WhatsApp:', error);
    return null;
  }
  
  return data as string | null;
};
