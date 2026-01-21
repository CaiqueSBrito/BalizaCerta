import { supabase } from '@/integrations/supabase/client';

export type UpsertStudentRecordInput = {
  userId: string;
  whatsapp: string;
  temVeiculo: boolean;
  dificuldades: string | null;
};

/**
 * Garante que exista (ou atualiza) o registro do aluno na tabela `students`.
 * Usa upsert por `id` para funcionar tanto no fluxo com sessão imediata quanto após confirmação de e-mail.
 */
export async function upsertStudentRecord(input: UpsertStudentRecordInput) {
  const { userId, whatsapp, temVeiculo, dificuldades } = input;

  if (!userId) {
    return { error: new Error('userId ausente') };
  }

  if (!whatsapp) {
    return { error: new Error('whatsapp ausente') };
  }

  const { error } = await supabase
    .from('students')
    .upsert(
      {
        id: userId,
        whatsapp,
        tem_veiculo: temVeiculo,
        dificuldades,
      },
      { onConflict: 'id' }
    );

  return { error };
}
