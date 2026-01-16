# Edge Functions - Shared Utilities

This folder contains shared utilities for all Supabase Edge Functions.

## Rate Limiting

Import and use the rate limiter to protect your endpoints from brute-force attacks:

```typescript
import { 
  checkRateLimit, 
  getClientIP, 
  createRateLimitResponse, 
  addRateLimitHeaders,
  RATE_LIMITS 
} from '../_shared/rate-limiter.ts';

Deno.serve(async (req) => {
  // Get client identifier
  const clientIP = getClientIP(req);
  
  // Check rate limit (use pre-configured limits or custom)
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.AUTH);
  
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult, corsHeaders);
  }

  // Your logic here...
  
  // Add rate limit headers to response
  const response = new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
  
  return addRateLimitHeaders(response, rateLimitResult);
});
```

### Pre-configured Rate Limits

- `RATE_LIMITS.AUTH`: 5 requests/minute - For login, signup, password reset
- `RATE_LIMITS.API`: 30 requests/minute - Standard API operations
- `RATE_LIMITS.READ`: 100 requests/minute - Read-only operations
- `RATE_LIMITS.SENSITIVE`: 3 requests/5 minutes - Password change, delete account

### Custom Rate Limits

```typescript
const customLimit = {
  maxRequests: 10,
  windowSeconds: 120,
  keyPrefix: 'custom'
};

const result = checkRateLimit(clientIP, customLimit);
```

## CORS Utilities

```typescript
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Your logic...
  
  // Success response
  return jsonResponse({ data: 'value' });
  
  // Error response (with generic user-friendly messages)
  return errorResponse('Internal error details', 500);
});
```

## Security Notes

1. **Leaked Password Protection**: Enable in Supabase Dashboard:
   - Go to Authentication → Settings → Security
   - Enable "Check for leaked passwords"
   
2. **Rate Limiting Limitations**: 
   - This is an in-memory rate limiter (resets on cold start)
   - For production with high traffic, consider Redis or database-based limiting

3. **Always validate inputs** before processing
4. **Log errors** but return generic messages to users
