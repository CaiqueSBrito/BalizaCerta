-- ============================================
-- FIX: Restrict profiles table to own profile only
-- This prevents exposure of email, CPF, phone, WhatsApp
-- ============================================

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Perfis são públicos para leitura" ON public.profiles;

-- Create restrictive policy: users can only see their OWN profile
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- ============================================
-- Add RLS policy to instructors_public view for anonymous access
-- ============================================

-- Note: Views with security_invoker=on inherit underlying table RLS
-- The instructors_public view already masks sensitive data
-- But we need a policy on the view itself for anon access
-- Since we can't add RLS to views directly, we ensure the 
-- instructors table policy allows reading for active instructors

-- Verify instructors policy is correct (it already is: is_active = true)
-- No changes needed to instructors table policies

-- ============================================
-- Ensure the instructors_public view is accessible
-- Views don't have RLS, they inherit from source tables
-- The view uses security_invoker=on so it respects RLS on source tables
-- But since profiles RLS now restricts to auth.uid() = id,
-- the view won't work for anonymous users accessing other users' profiles
-- 
-- SOLUTION: Create a SECURITY DEFINER function to get instructor public data
-- This bypasses RLS safely because it only returns non-sensitive fields
-- ============================================

-- Create a function to get instructor public data safely
CREATE OR REPLACE FUNCTION public.get_instructors_public(
  p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  id UUID,
  profile_id UUID,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  price_per_hour NUMERIC,
  cnh_category cnh_category[],
  cnh_years INTEGER,
  has_vehicle BOOLEAN,
  plan instructor_plan,
  city TEXT,
  state TEXT,
  rating NUMERIC,
  review_count INTEGER,
  specialties TEXT[],
  is_verified BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  whatsapp_masked TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    i.id,
    i.profile_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    i.bio,
    i.price_per_hour,
    i.cnh_category,
    i.cnh_years,
    i.has_vehicle,
    i.plan,
    i.city,
    i.state,
    i.rating,
    i.review_count,
    i.specialties,
    i.is_verified,
    i.is_active,
    i.created_at,
    CASE 
      WHEN p.whatsapp IS NOT NULL AND p.whatsapp != '' 
      THEN LEFT(p.whatsapp, 5) || '****-****'
      ELSE '****-****'
    END as whatsapp_masked
  FROM instructors i
  JOIN profiles p ON i.profile_id = p.id
  WHERE i.is_active = p_is_active;
$$;

-- Create function to get single instructor by ID (for profile page)
CREATE OR REPLACE FUNCTION public.get_instructor_by_id(p_instructor_id UUID)
RETURNS TABLE (
  id UUID,
  profile_id UUID,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  price_per_hour NUMERIC,
  cnh_category cnh_category[],
  cnh_years INTEGER,
  has_vehicle BOOLEAN,
  plan instructor_plan,
  city TEXT,
  state TEXT,
  rating NUMERIC,
  review_count INTEGER,
  specialties TEXT[],
  is_verified BOOLEAN,
  is_active BOOLEAN,
  detran_certificate TEXT,
  created_at TIMESTAMPTZ,
  whatsapp_masked TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    i.id,
    i.profile_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    i.bio,
    i.price_per_hour,
    i.cnh_category,
    i.cnh_years,
    i.has_vehicle,
    i.plan,
    i.city,
    i.state,
    i.rating,
    i.review_count,
    i.specialties,
    i.is_verified,
    i.is_active,
    i.detran_certificate,
    i.created_at,
    CASE 
      WHEN p.whatsapp IS NOT NULL AND p.whatsapp != '' 
      THEN LEFT(p.whatsapp, 5) || '****-****'
      ELSE '****-****'
    END as whatsapp_masked
  FROM instructors i
  JOIN profiles p ON i.profile_id = p.id
  WHERE i.id = p_instructor_id;
$$;

-- Create function to get WhatsApp for authenticated users (contact flow)
-- This is used when a user clicks "Contact via WhatsApp"
CREATE OR REPLACE FUNCTION public.get_instructor_whatsapp(p_instructor_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_whatsapp TEXT;
BEGIN
  -- Only return WhatsApp for active instructors
  SELECT p.whatsapp INTO v_whatsapp
  FROM instructors i
  JOIN profiles p ON i.profile_id = p.id
  WHERE i.id = p_instructor_id
    AND i.is_active = true;
  
  RETURN v_whatsapp;
END;
$$;