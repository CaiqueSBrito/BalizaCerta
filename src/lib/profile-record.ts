import { supabase } from '@/integrations/supabase/client';

export type UpsertProfileRecordInput = {
  userId: string;
  email: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  whatsapp: string | null;
  userType: 'student' | 'instructor';
  hasVehicle: boolean | null;
  difficulties: string | null;
  age?: number | null;
};

/**
 * Garante que exista (ou atualiza) o registro base na tabela `profiles`.
 * Usa upsert por `id` para ser idempotente e evitar falhas quando um trigger já criou o perfil.
 */
export async function upsertProfileRecord(input: UpsertProfileRecordInput) {
  const {
    userId,
    email,
    fullName,
    firstName,
    lastName,
    whatsapp,
    userType,
    hasVehicle,
    difficulties,
    age,
  } = input;

  if (!userId) return { error: new Error('userId ausente') };
  if (!email) return { error: new Error('email ausente') };
  if (!fullName) return { error: new Error('fullName ausente') };

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        email: email.slice(0, 255),
        full_name: fullName.slice(0, 100),
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        whatsapp,
        has_vehicle: hasVehicle,
        difficulties,
        age: typeof age === 'number' ? age : null,
      },
      { onConflict: 'id' }
    );

  return { error };
}
