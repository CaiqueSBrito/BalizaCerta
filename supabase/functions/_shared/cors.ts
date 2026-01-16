/**
 * CORS headers for Edge Functions
 * Centralized CORS configuration for consistency across all functions
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Handle CORS preflight requests
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Create a JSON response with CORS headers
 */
export function jsonResponse(
  data: unknown,
  status = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...additionalHeaders,
    },
  });
}

/**
 * Create an error response with CORS headers
 * Uses generic error messages to avoid exposing internal details
 */
export function errorResponse(
  message: string,
  status = 500,
  additionalHeaders: Record<string, string> = {}
): Response {
  console.error(`Error response (${status}):`, message);
  
  // Map to user-friendly messages
  const userMessage = status === 429 
    ? 'Muitas tentativas. Aguarde um momento.'
    : status === 401 
    ? 'Não autorizado. Faça login novamente.'
    : status === 403 
    ? 'Acesso negado.'
    : status === 404 
    ? 'Recurso não encontrado.'
    : 'Ocorreu um erro. Tente novamente.';

  return new Response(
    JSON.stringify({ error: userMessage }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...additionalHeaders,
      },
    }
  );
}
