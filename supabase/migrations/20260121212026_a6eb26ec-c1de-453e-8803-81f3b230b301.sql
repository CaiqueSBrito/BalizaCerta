-- Add Stripe subscription fields to instructors table
ALTER TABLE public.instructors
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Add index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_instructors_stripe_customer_id ON public.instructors(stripe_customer_id);

-- Function to update instructor to Pro plan (called by webhook)
CREATE OR REPLACE FUNCTION public.upgrade_instructor_to_pro(
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_subscription_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE instructors
  SET 
    plan = 'pro',
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    subscription_status = 'active',
    subscription_end_date = p_subscription_end_date,
    updated_at = now()
  WHERE profile_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Function to downgrade instructor (for subscription cancellation)
CREATE OR REPLACE FUNCTION public.downgrade_instructor_to_free(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE instructors
  SET 
    plan = 'free',
    subscription_status = 'inactive',
    subscription_end_date = NULL,
    updated_at = now()
  WHERE profile_id = p_user_id;
  
  RETURN FOUND;
END;
$$;