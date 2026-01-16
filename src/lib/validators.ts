import { z } from 'zod';

// Função para validar CPF
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[9])) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[10])) return false;
  
  return true;
};

// Função para formatar CPF
export const formatCPF = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '');
  if (cleanValue.length <= 3) return cleanValue;
  if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
  if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
  return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
};

// Função para formatar WhatsApp
export const formatWhatsApp = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '');
  if (cleanValue.length <= 2) return cleanValue.length ? `(${cleanValue}` : '';
  if (cleanValue.length <= 7) return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
  return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`;
};

// Schema de validação para cadastro de instrutor
export const instructorRegistrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  
  lastName: z
    .string()
    .trim()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras'),
  
  email: z
    .string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  
  whatsapp: z
    .string()
    .trim()
    .refine((val) => {
      const clean = val.replace(/[^\d]/g, '');
      return clean.length >= 10 && clean.length <= 11;
    }, 'WhatsApp deve ter DDD + número (10 ou 11 dígitos)'),
  
  age: z
    .number()
    .int('Idade deve ser um número inteiro')
    .min(18, 'Você deve ter pelo menos 18 anos')
    .max(100, 'Idade inválida'),
  
  cpf: z
    .string()
    .trim()
    .refine((val) => validateCPF(val), 'CPF inválido'),
  
  detranCertificate: z
    .string()
    .trim()
    .min(5, 'Número do certificado DETRAN é obrigatório')
    .max(50, 'Certificado deve ter no máximo 50 caracteres'),
  
  password: z
    .string()
    .optional()
    .refine((val) => {
      // Senha é opcional se vazia (modo completar cadastro)
      if (!val || val.length === 0) return true;
      // Se preenchida, deve ter pelo menos 8 caracteres
      return val.length >= 8;
    }, 'Senha deve ter pelo menos 8 caracteres')
    .refine((val) => {
      if (!val || val.length === 0) return true;
      return /[A-Z]/.test(val);
    }, 'Senha deve conter pelo menos uma letra maiúscula')
    .refine((val) => {
      if (!val || val.length === 0) return true;
      return /[a-z]/.test(val);
    }, 'Senha deve conter pelo menos uma letra minúscula')
    .refine((val) => {
      if (!val || val.length === 0) return true;
      return /[0-9]/.test(val);
    }, 'Senha deve conter pelo menos um número'),
  
  confirmPassword: z.string().optional(),
  
  // Campos opcionais do instrutor
  bio: z
    .string()
    .trim()
    .max(500, 'Bio deve ter no máximo 500 caracteres')
    .optional(),
  
  pricePerHour: z
    .number()
    .min(0, 'Preço não pode ser negativo')
    .max(1000, 'Preço máximo é R$ 1000')
    .optional(),
  
  cnhCategory: z
    .array(z.enum(['A', 'B', 'AB', 'C', 'D', 'E']))
    .min(1, 'Selecione pelo menos uma categoria de CNH'),
  
  cnhYears: z
    .number()
    .int()
    .min(0, 'Anos de CNH não pode ser negativo')
    .max(50, 'Anos de CNH inválido'),
  
  hasVehicle: z.boolean(),
  
  city: z
    .string()
    .trim()
    .min(2, 'Cidade é obrigatória')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  
  state: z
    .string()
    .trim()
    .length(2, 'Estado deve ter 2 caracteres (ex: SP)'),
  
  specialties: z
    .array(z.string())
    .optional(),
}).refine((data) => {
  // Se senha não foi preenchida, não precisa validar confirmação
  if (!data.password || data.password.length === 0) return true;
  return data.password === data.confirmPassword;
}, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type InstructorRegistrationData = z.infer<typeof instructorRegistrationSchema>;
