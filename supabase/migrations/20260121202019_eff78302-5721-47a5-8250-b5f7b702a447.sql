-- Adicionar campo para rastrear se o instrutor selecionou um plano
ALTER TABLE public.instructors 
ADD COLUMN IF NOT EXISTS plan_selected_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Atualizar instrutores existentes para marcar que já selecionaram (evitar bloqueio)
UPDATE public.instructors 
SET plan_selected_at = created_at 
WHERE plan_selected_at IS NULL;