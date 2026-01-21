import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STRIPE_PRO_PRICE_ID = 'price_1Ss8LVHkaUQgqOaK7IA8qPwq';

export const useStripeCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);

  const startCheckout = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: STRIPE_PRO_PRICE_ID },
      });

      if (error) {
        console.error('[Stripe] Checkout error:', error);
        toast.error('Erro ao iniciar pagamento. Tente novamente.');
        return false;
      }

      if (data?.url) {
        window.location.href = data.url;
        return true;
      } else {
        toast.error('Erro ao gerar link de pagamento.');
        return false;
      }
    } catch (error) {
      console.error('[Stripe] Unexpected error:', error);
      toast.error('Erro inesperado. Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { startCheckout, isLoading };
};
