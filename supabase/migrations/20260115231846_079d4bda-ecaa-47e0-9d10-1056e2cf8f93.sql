-- Remover políticas de INSERT conflitantes
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.instructors;
DROP POLICY IF EXISTS "Instrutores podem inserir seus próprios dados" ON public.instructors;

-- Criar política de INSERT permissiva
-- Permite que usuários autenticados insiram quando profile_id = seu próprio ID
CREATE POLICY "Authenticated users can insert their own instructor profile"
ON public.instructors
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

-- Verificar se a política de SELECT existe e está correta
-- (permitir leitura pública para instrutores ativos)
DROP POLICY IF EXISTS "Instrutores são públicos para leitura" ON public.instructors;

CREATE POLICY "Public can read active instructors"
ON public.instructors
FOR SELECT
TO public
USING (is_active = true);

-- Verificar políticas de UPDATE e DELETE
DROP POLICY IF EXISTS "Instrutores podem atualizar seus próprios dados" ON public.instructors;
DROP POLICY IF EXISTS "Instrutores podem deletar seus próprios dados" ON public.instructors;

CREATE POLICY "Instructors can update their own data"
ON public.instructors
FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Instructors can delete their own data"
ON public.instructors
FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);