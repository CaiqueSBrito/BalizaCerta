-- =====================================================
-- CORREÇÕES DE SEGURANÇA ADICIONAIS - BalizaCerta
-- =====================================================

-- 1. REMOVER A POLÍTICA PÚBLICA DA TABELA INSTRUCTORS
-- O acesso público deve ser apenas via VIEW ou funções RPC
DROP POLICY IF EXISTS "Public can read active instructors" ON public.instructors;

-- 2. CRIAR POLÍTICA RESTRITIVA PARA TABELA INSTRUCTORS
-- Apenas o próprio instrutor e admins podem ler diretamente
CREATE POLICY "Only owner and admins can read instructors directly"
ON public.instructors
FOR SELECT
USING (
  auth.uid() = profile_id 
  OR public.is_admin(auth.uid())
);

-- 3. PROTEGER A TABELA USER_ROLES
-- Apenas admins podem inserir, atualizar ou deletar roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.is_admin(auth.uid()));

-- 4. PROTEGER A TABELA CONNECTIONS CONTRA UPDATE/DELETE NÃO AUTORIZADOS
CREATE POLICY "Students can update their own connections"
ON public.connections
FOR UPDATE
USING (auth.uid() = student_id);

CREATE POLICY "Students can delete their own connections"
ON public.connections
FOR DELETE
USING (auth.uid() = student_id);

CREATE POLICY "Admins can update any connection"
ON public.connections
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete any connection"
ON public.connections
FOR DELETE
USING (public.is_admin(auth.uid()));

-- 5. ATUALIZAR AS FUNÇÕES RPC PARA SEREM A ÚNICA FORMA DE ACESSO PÚBLICO
-- A função get_instructors_public já está segura (SECURITY DEFINER)
-- A função get_instructor_by_id já está segura (SECURITY DEFINER)
-- A função contact_instructor já está segura (SECURITY DEFINER)

-- 6. GARANTIR QUE A VIEW instructors_public NÃO EXPONHA DADOS SENSÍVEIS
-- Recriar com security_invoker para herdar as políticas RLS
DROP VIEW IF EXISTS public.instructors_public;

CREATE VIEW public.instructors_public
WITH (security_invoker = on) AS
SELECT 
  i.id,
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

-- A view com security_invoker=on herda as políticas RLS das tabelas base
-- Como instructors agora só permite leitura para owner/admin,
-- o acesso público deve ser exclusivamente via funções RPC SECURITY DEFINER

-- 7. COMENTÁRIO: O FLUXO SEGURO É:
-- - Público usa get_instructors_public() para listar instrutores (dados mascarados)
-- - Público usa get_instructor_by_id() para ver perfil (dados mascarados)
-- - Autenticado usa contact_instructor() para obter WhatsApp real E registrar lead
-- - Instrutor vê seus próprios dados via SELECT direto (RLS permite)
-- - Admin vê tudo via SELECT direto (RLS permite via is_admin())

COMMENT ON FUNCTION public.get_instructors_public IS 'Retorna lista de instrutores ativos com dados públicos. WhatsApp é mascarado para segurança.';
COMMENT ON FUNCTION public.get_instructor_by_id IS 'Retorna um instrutor por ID com dados públicos. WhatsApp é mascarado para segurança.';
COMMENT ON FUNCTION public.contact_instructor IS 'Registra uma conexão (lead) e retorna o WhatsApp real do instrutor. Requer autenticação.';
COMMENT ON FUNCTION public.get_instructor_whatsapp IS 'Retorna WhatsApp de instrutor apenas se já houver uma conexão registrada ou se for admin.';