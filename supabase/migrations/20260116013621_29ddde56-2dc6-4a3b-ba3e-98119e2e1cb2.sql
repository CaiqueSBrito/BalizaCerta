-- =====================================================
-- AUDITORIA DE SEGURANÇA COMPLETA - BalizaCerta
-- =====================================================

-- 1. REMOVER A VIEW PROBLEMÁTICA instructors_public
-- Esta view expõe dados sensíveis (whatsapp) sem RLS
DROP VIEW IF EXISTS public.instructors_public;

-- 2. RECRIAR A VIEW SEM O CAMPO WHATSAPP SENSÍVEL
-- Mantém apenas whatsapp_masked para segurança
CREATE VIEW public.instructors_public
WITH (security_invoker = on) AS
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
  -- Apenas o WhatsApp mascarado - NUNCA o número completo
  CASE 
    WHEN p.whatsapp IS NOT NULL AND p.whatsapp != '' 
    THEN LEFT(p.whatsapp, 5) || '****-****'
    ELSE '****-****'
  END as whatsapp_masked
FROM instructors i
JOIN profiles p ON i.profile_id = p.id
WHERE i.is_active = true;

-- 3. POLÍTICA PARA INSTRUTORES VEREM SUAS CONEXÕES (LEADS)
-- Permite que instrutores vejam os alunos que entraram em contato
CREATE POLICY "Instrutores podem ver suas conexões"
ON public.connections
FOR SELECT
USING (
  auth.uid() IN (
    SELECT profile_id FROM public.instructors WHERE id = instructor_id
  )
);

-- 4. CRIAR TABELA DE ROLES PARA ADMINISTRADORES
-- Seguindo as melhores práticas de segurança
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Habilitar RLS na tabela de roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver seus próprios roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- 5. FUNÇÃO SEGURA PARA VERIFICAR ROLES (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. FUNÇÃO SEGURA PARA VERIFICAR SE É ADMIN
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- 7. POLÍTICA PARA ADMINS VEREM TODAS AS CONEXÕES
CREATE POLICY "Admins podem ver todas as conexões"
ON public.connections
FOR SELECT
USING (public.is_admin(auth.uid()));

-- 8. POLÍTICAS PARA ADMINS NA TABELA PROFILES
-- Admins podem ver todos os perfis (incluindo dados sensíveis)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- 9. POLÍTICAS PARA ADMINS NA TABELA INSTRUCTORS
CREATE POLICY "Admins can view all instructors"
ON public.instructors
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update any instructor"
ON public.instructors
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- 10. ATUALIZAR FUNÇÃO get_instructor_whatsapp PARA INCLUIR VERIFICAÇÃO DE CONEXÃO
-- Agora só retorna o WhatsApp se o usuário tiver uma conexão válida com o instrutor
CREATE OR REPLACE FUNCTION public.get_instructor_whatsapp(p_instructor_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_whatsapp TEXT;
  v_has_connection BOOLEAN;
  v_is_admin BOOLEAN;
BEGIN
  -- Verificar se é admin
  v_is_admin := public.is_admin(auth.uid());
  
  -- Verificar se tem uma conexão registrada (apenas se não for admin)
  IF NOT v_is_admin THEN
    SELECT EXISTS(
      SELECT 1 FROM connections 
      WHERE instructor_id = p_instructor_id 
      AND student_id = auth.uid()
    ) INTO v_has_connection;
    
    -- Se não tiver conexão, não retorna o WhatsApp
    IF NOT v_has_connection THEN
      RETURN NULL;
    END IF;
  END IF;
  
  -- Retorna WhatsApp apenas para instrutores ativos
  SELECT p.whatsapp INTO v_whatsapp
  FROM instructors i
  JOIN profiles p ON i.profile_id = p.id
  WHERE i.id = p_instructor_id
    AND i.is_active = true;
  
  RETURN v_whatsapp;
END;
$$;

-- 11. CRIAR FUNÇÃO PARA REGISTRAR CONEXÃO E OBTER WHATSAPP
-- Esta função registra o lead E retorna o WhatsApp em uma única operação atômica
CREATE OR REPLACE FUNCTION public.contact_instructor(p_instructor_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_whatsapp TEXT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Verificar se está autenticado
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Inserir ou atualizar conexão (upsert)
  INSERT INTO connections (student_id, instructor_id, contacted_at)
  VALUES (v_user_id, p_instructor_id, now())
  ON CONFLICT (student_id, instructor_id) 
  DO UPDATE SET contacted_at = now();
  
  -- Retornar o WhatsApp
  SELECT p.whatsapp INTO v_whatsapp
  FROM instructors i
  JOIN profiles p ON i.profile_id = p.id
  WHERE i.id = p_instructor_id
    AND i.is_active = true;
  
  RETURN v_whatsapp;
END;
$$;

-- 12. ADICIONAR CONSTRAINT ÚNICA PARA EVITAR DUPLICATAS DE CONEXÕES
-- (Se ainda não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'connections_student_instructor_unique'
  ) THEN
    ALTER TABLE public.connections 
    ADD CONSTRAINT connections_student_instructor_unique 
    UNIQUE (student_id, instructor_id);
  END IF;
END $$;