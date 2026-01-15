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
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string;
    avatar_url: string | null;
    whatsapp: string | null;
  };
}

export const useInstructorSearch = (filters: InstructorSearchFilters) => {
  return useQuery({
    queryKey: ['instructors-search', filters],
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
            avatar_url,
            whatsapp
          )
        `)
        .eq('is_active', true);

      // Filter by city (case-insensitive partial match)
      if (filters.city && filters.city.trim()) {
        query = query.ilike('city', `%${filters.city.trim()}%`);
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
        query = query.contains('cnh_category', [mappedCategory]);
      }

      // Filter by specialty
      if (filters.specialty && filters.specialty.trim()) {
        query = query.contains('specialties', [filters.specialty]);
      }

      // Filter by price range
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        query = query.gte('price_per_hour', filters.minPrice);
      }
      if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        query = query.lte('price_per_hour', filters.maxPrice);
      }

      // Filter by minimum rating
      if (filters.minRating !== undefined && filters.minRating > 0) {
        query = query.gte('rating', filters.minRating);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching instructors:', error);
        throw error;
      }

      // Sort: PRO first, then by rating
      const sortedData = (data as SearchInstructor[]).sort((a, b) => {
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
          created_at,
          profiles (
            id,
            first_name,
            last_name,
            full_name,
            avatar_url,
            whatsapp
          )
        `)
        .eq('is_active', true)
        .eq('plan', 'pro')
        .order('rating', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured instructors:', error);
        throw error;
      }

      return data as SearchInstructor[];
    },
  });
};
