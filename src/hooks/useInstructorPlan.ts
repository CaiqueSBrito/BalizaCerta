import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InstructorPlanData {
  plan: 'free' | 'pro';
  subscriptionStatus: string | null;
  subscriptionEndDate: string | null;
  isVerified: boolean;
}

export const useInstructorPlan = () => {
  const { user } = useAuth();
  const [planData, setPlanData] = useState<InstructorPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlanData = useCallback(async () => {
    if (!user) {
      setPlanData(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('instructors')
        .select('plan, subscription_status, subscription_end_date, is_verified')
        .eq('profile_id', user.id)
        .single();

      if (error) {
        console.error('[useInstructorPlan] Error fetching plan:', error);
        setPlanData(null);
      } else {
        setPlanData({
          plan: data.plan as 'free' | 'pro',
          subscriptionStatus: data.subscription_status,
          subscriptionEndDate: data.subscription_end_date,
          isVerified: data.is_verified || false,
        });
      }
    } catch (error) {
      console.error('[useInstructorPlan] Unexpected error:', error);
      setPlanData(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchPlanData();
  }, [fetchPlanData]);

  // Real-time subscription to instructor plan changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`instructor-plan-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'instructors',
          filter: `profile_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[useInstructorPlan] Real-time update received:', payload);
          const newData = payload.new as {
            plan: string;
            subscription_status: string | null;
            subscription_end_date: string | null;
            is_verified: boolean | null;
          };
          
          setPlanData({
            plan: newData.plan as 'free' | 'pro',
            subscriptionStatus: newData.subscription_status,
            subscriptionEndDate: newData.subscription_end_date,
            isVerified: newData.is_verified || false,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    planData,
    isLoading,
    isPro: planData?.plan === 'pro',
    isFree: planData?.plan === 'free' || !planData,
    isVerified: planData?.isVerified || false,
    refetch: fetchPlanData,
  };
};
