/**
 * Utility functions for input sanitization to prevent XSS and injection attacks.
 * All user inputs should be sanitized before being sent to the database or displayed.
 */

/**
 * Removes HTML tags and dangerous patterns from text input.
 * Use this for free-text fields like bio, comments, messages.
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    // Remove potentially dangerous characters for SQL (extra layer of safety)
    .replace(/[;'"\\]/g, (char) => {
      // Allow apostrophes in names like "O'Connor" but escape them
      if (char === "'") return "'";
      return '';
    })
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Strict sanitization for names - only allows letters, spaces, and accents.
 */
export const sanitizeName = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Only allow letters (including accented), spaces, apostrophes (for O'Connor etc), and hyphens
    .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50); // Enforce max length
};

/**
 * Sanitizes email - removes dangerous characters while keeping valid email chars.
 */
export const sanitizeEmail = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .toLowerCase()
    .trim()
    // Remove potentially dangerous characters
    .replace(/[<>'"\\;]/g, '')
    // Only allow valid email characters
    .replace(/[^a-z0-9@._+-]/g, '')
    .slice(0, 255); // Enforce max length
};

/**
 * Sanitizes numeric input - only allows digits.
 */
export const sanitizeNumeric = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input.replace(/[^\d]/g, '');
};

/**
 * Sanitizes CPF - only allows digits, enforces max length.
 */
export const sanitizeCPF = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input.replace(/[^\d]/g, '').slice(0, 11);
};

/**
 * Sanitizes WhatsApp number - only allows digits, enforces max length.
 */
export const sanitizeWhatsApp = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input.replace(/[^\d]/g, '').slice(0, 11);
};

/**
 * Sanitizes price/currency - only allows numbers and decimal point.
 */
export const sanitizePrice = (input: string | number): number => {
  if (typeof input === 'number') {
    return Math.max(0, Math.min(input, 10000)); // Max R$10,000
  }
  
  if (!input || typeof input !== 'string') return 0;
  
  const cleaned = input.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) return 0;
  return Math.max(0, Math.min(parsed, 10000));
};

/**
 * Sanitizes age - ensures it's a valid integer within range.
 */
export const sanitizeAge = (input: string | number): number => {
  const num = typeof input === 'number' ? input : parseInt(String(input).replace(/[^\d]/g, ''), 10);
  
  if (isNaN(num)) return 18;
  return Math.max(18, Math.min(num, 100));
};

/**
 * Sanitizes city name - only allows letters, spaces, and common punctuation.
 */
export const sanitizeCity = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Only allow letters (including accented), spaces, and hyphens
    .replace(/[^a-zA-ZÀ-ÿ\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
};

/**
 * Sanitizes state code - only allows 2 uppercase letters.
 */
export const sanitizeState = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 2);
};

/**
 * Maps Supabase/database errors to user-friendly messages.
 * NEVER expose raw error messages to users.
 */
export const mapErrorToUserMessage = (error: unknown): string => {
  if (!error) return 'Ocorreu um erro. Por favor, tente novamente.';
  
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  
  // Authentication errors
  if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (message.includes('email not confirmed')) {
    return 'E-mail não confirmado. Verifique sua caixa de entrada.';
  }
  if (message.includes('user already registered') || message.includes('already been registered')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (message.includes('password')) {
    return 'Senha inválida. Verifique os requisitos de segurança.';
  }
  
  // Database constraint errors
  if (message.includes('duplicate') || message.includes('unique')) {
    if (message.includes('cpf')) {
      return 'Este CPF já está cadastrado.';
    }
    if (message.includes('email')) {
      return 'Este e-mail já está cadastrado.';
    }
    if (message.includes('whatsapp') || message.includes('phone')) {
      return 'Este número de WhatsApp já está cadastrado.';
    }
    return 'Este registro já existe.';
  }
  
  // RLS/permission errors
  if (message.includes('row-level security') || message.includes('rls') || message.includes('policy')) {
    return 'Você não tem permissão para realizar esta ação.';
  }
  
  // Validation errors
  if (message.includes('check constraint') || message.includes('invalid input')) {
    return 'Dados inválidos. Verifique as informações e tente novamente.';
  }
  
  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  
  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }
  
  // Default - never expose the actual error message
  return 'Ocorreu um erro. Por favor, tente novamente.';
};

/**
 * Validates and sanitizes URL for safe redirect.
 */
export const sanitizeRedirectUrl = (url: string, allowedOrigin: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const parsed = new URL(url);
    const allowed = new URL(allowedOrigin);
    
    // Only allow same-origin redirects
    if (parsed.origin !== allowed.origin) {
      return null;
    }
    
    return parsed.pathname + parsed.search;
  } catch {
    // If it's a relative path, ensure it starts with /
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url.split('?')[0]; // Remove query params for safety
    }
    return null;
  }
};
