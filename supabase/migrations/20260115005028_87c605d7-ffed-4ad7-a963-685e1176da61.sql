-- Adicionar novos campos na tabela profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Adicionar campo de certificado DETRAN na tabela instructors
ALTER TABLE public.instructors
  ADD COLUMN IF NOT EXISTS detran_certificate TEXT;

-- Migrar dados existentes de full_name para first_name/last_name
UPDATE public.profiles 
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN POSITION(' ' IN full_name) > 0 
    THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- Criar view pública que oculta dados sensíveis (CPF, email pessoal)
CREATE OR REPLACE VIEW public.instructors_public
WITH (security_invoker = on) AS
SELECT 
  i.id,
  i.profile_id,
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
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.whatsapp,
  -- Oculta parte do WhatsApp para não-autenticados
  CASE 
    WHEN auth.uid() IS NOT NULL THEN p.whatsapp
    ELSE CONCAT(LEFT(p.whatsapp, 5), '****-****')
  END as whatsapp_masked
FROM public.instructors i
JOIN public.profiles p ON i.profile_id = p.id
WHERE i.is_active = true;

-- Função para validar CPF (formato básico)
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Remove formatação
  cpf := REGEXP_REPLACE(cpf, '[^0-9]', '', 'g');
  -- Verifica se tem 11 dígitos
  RETURN LENGTH(cpf) = 11;
END;
$$;

-- Função para validar WhatsApp brasileiro
CREATE OR REPLACE FUNCTION public.validate_whatsapp(phone TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Remove formatação
  phone := REGEXP_REPLACE(phone, '[^0-9]', '', 'g');
  -- Verifica se tem 10 ou 11 dígitos (com DDD)
  RETURN LENGTH(phone) >= 10 AND LENGTH(phone) <= 11;
END;
$$;

-- Atualizar a função de criação de perfil para usar os novos campos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, full_name, email, user_type, whatsapp, age)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(
      CONCAT(
        COALESCE(new.raw_user_meta_data ->> 'first_name', ''), 
        ' ', 
        COALESCE(new.raw_user_meta_data ->> 'last_name', '')
      ),
      'Usuário'
    ),
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'user_type')::public.user_type, 'student'),
    new.raw_user_meta_data ->> 'whatsapp',
    (new.raw_user_meta_data ->> 'age')::INTEGER
  );
  RETURN new;
END;
$$;

-- Adicionar constraint de check para idade mínima (18 anos para instrutores)
ALTER TABLE public.profiles
  ADD CONSTRAINT check_age_positive CHECK (age IS NULL OR age >= 18);

-- Índice para busca por CPF (para validação de duplicidade)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles(cpf) WHERE cpf IS NOT NULL;