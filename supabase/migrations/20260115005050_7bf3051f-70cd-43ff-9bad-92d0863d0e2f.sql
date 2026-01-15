-- Corrigir search_path nas funções de validação
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- Remove formatação
  cpf := REGEXP_REPLACE(cpf, '[^0-9]', '', 'g');
  -- Verifica se tem 11 dígitos
  RETURN LENGTH(cpf) = 11;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_whatsapp(phone TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- Remove formatação
  phone := REGEXP_REPLACE(phone, '[^0-9]', '', 'g');
  -- Verifica se tem 10 ou 11 dígitos (com DDD)
  RETURN LENGTH(phone) >= 10 AND LENGTH(phone) <= 11;
END;
$$;