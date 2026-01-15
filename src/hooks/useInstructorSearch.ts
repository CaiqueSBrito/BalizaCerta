import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InstructorSearchFilters {
  city?: string;
  category?: string;
  specialty?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export interface SearchInstructor {
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
}

export const useInstructorSearch = (filters: InstructorSearchFilters) => {
  return useQuery({
    queryKey: ['instructors-search', filters],
    queryFn: async () => {
      // Use secure RPC function that returns only public data with masked WhatsApp
      const { data, error } = await supabase.rpc('get_instructors_public', {
        p_is_active: true
      });

      if (error) {
        console.error('Error fetching instructors:', error);
        throw error;
      }

      let filteredData = data as SearchInstructor[];

      // Filter by city (case-insensitive partial match)
      if (filters.city && filters.city.trim()) {
        const citySearch = filters.city.trim().toLowerCase();
        filteredData = filteredData.filter(
          (instructor) => instructor.city?.toLowerCase().includes(citySearch)
        );
      }

      // Filter by CNH category
      if (filters.category && filters.category.trim()) {
        const categoryMap: Record<string, string> = {
          'cnh-a': 'A',
          'cnh-b': 'B',
          'cnh-ab': 'AB',
          'cnh-c': 'C',
          'cnh-d': 'D',
          'cnh-e': 'E',
        };
        const mappedCategory = categoryMap[filters.category.toLowerCase()] || filters.category.toUpperCase();
        filteredData = filteredData.filter(
          (instructor) => instructor.cnh_category?.includes(mappedCategory)
        );
      }

      // Filter by specialty
      if (filters.specialty && filters.specialty.trim()) {
        filteredData = filteredData.filter(
          (instructor) => instructor.specialties?.includes(filters.specialty!)
        );
      }

      // Filter by price range
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        filteredData = filteredData.filter(
          (instructor) => instructor.price_per_hour >= filters.minPrice!
        );
      }
      if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        filteredData = filteredData.filter(
          (instructor) => instructor.price_per_hour <= filters.maxPrice!
        );
      }

      // Filter by minimum rating
      if (filters.minRating !== undefined && filters.minRating > 0) {
        filteredData = filteredData.filter(
          (instructor) => instructor.rating >= filters.minRating!
        );
      }

      // Sort: PRO first, then by rating
      const sortedData = filteredData.sort((a, b) => {
        // PRO instructors first
        if (a.plan === 'pro' && b.plan !== 'pro') return -1;
        if (a.plan !== 'pro' && b.plan === 'pro') return 1;
        // Then by rating
        return b.rating - a.rating;
      });

      return sortedData;
    },
  });
};

// Hook to get featured instructors (for fallback)
export const useFeaturedInstructors = () => {
  return useQuery({
    queryKey: ['featured-instructors'],
    queryFn: async () => {
      // Use secure RPC function that returns only public data with masked WhatsApp
      const { data, error } = await supabase.rpc('get_instructors_public', {
        p_is_active: true
      });

      if (error) {
        console.error('Error fetching featured instructors:', error);
        throw error;
      }

      // Filter to PRO instructors, sort by rating, limit to 6
      const proInstructors = (data as SearchInstructor[])
        .filter((instructor) => instructor.plan === 'pro')
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);

      return proInstructors;
    },
  });
};
