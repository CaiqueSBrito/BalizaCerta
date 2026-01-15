-- Fix handle_new_user() function to add input validation for security
-- This addresses the DEFINER_OR_RPC_BYPASS security finding

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
  v_full_name TEXT;
  v_whatsapp TEXT;
  v_age INTEGER;
BEGIN
  -- Validate and sanitize first_name (max 50 chars, trim whitespace)
  v_first_name := LEFT(TRIM(COALESCE(new.raw_user_meta_data ->> 'first_name', '')), 50);
  
  -- Validate and sanitize last_name (max 50 chars, trim whitespace)
  v_last_name := LEFT(TRIM(COALESCE(new.raw_user_meta_data ->> 'last_name', '')), 50);
  
  -- Build full_name from validated components
  v_full_name := NULLIF(TRIM(CONCAT(v_first_name, ' ', v_last_name)), '');
  IF v_full_name IS NULL OR v_full_name = '' THEN
    v_full_name := 'Usuário';
  END IF;
  
  -- Validate whatsapp using existing validation function
  v_whatsapp := new.raw_user_meta_data ->> 'whatsapp';
  IF v_whatsapp IS NOT NULL AND v_whatsapp != '' THEN
    -- Only store if valid format, otherwise set to NULL
    IF NOT public.validate_whatsapp(v_whatsapp) THEN
      v_whatsapp := NULL;
    END IF;
  END IF;
  
  -- Validate age (must be 18-100, otherwise set to NULL)
  BEGIN
    v_age := (new.raw_user_meta_data ->> 'age')::INTEGER;
    IF v_age IS NOT NULL AND (v_age < 18 OR v_age > 100) THEN
      v_age := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Invalid integer format, set to NULL
    v_age := NULL;
  END;

  INSERT INTO public.profiles (id, first_name, last_name, full_name, email, user_type, whatsapp, age)
  VALUES (
    new.id,
    v_first_name,
    v_last_name,
    v_full_name,
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'user_type')::public.user_type, 'student'),
    v_whatsapp,
    v_age
  );
  RETURN new;
END;
$$;