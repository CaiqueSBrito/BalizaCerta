/**
 * Simple in-memory rate limiter for Edge Functions
 * Prevents brute-force attacks by limiting requests per IP/identifier
 * 
 * Note: This is a per-instance limiter. For production with multiple instances,
 * consider using Redis or Supabase database for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (resets on function cold start)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Optional prefix for the key (e.g., 'auth', 'api') */
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const { maxRequests, windowSeconds, keyPrefix = '' } = config;
  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }

  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetTime) {
    // First request or window expired - reset counter
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetIn: windowSeconds,
    };
  }

  // Within window - check if limit exceeded
  if (entry.count >= maxRequests) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get client IP from request headers
 * Handles various proxy configurations
 */
export function getClientIP(req: Request): string {
  // Check common headers for client IP (in order of preference)
  const headers = [
    'cf-connecting-ip',     // Cloudflare
    'x-real-ip',            // Nginx proxy
    'x-forwarded-for',      // Standard proxy header
    'x-client-ip',          // Apache
  ];

  for (const header of headers) {
    const value = req.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim();
      if (ip) return ip;
    }
  }

  // Fallback - return a hash of user-agent + accept headers as identifier
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const accept = req.headers.get('accept') || 'unknown';
  return `unknown-${hashString(userAgent + accept)}`;
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Clean up expired rate limit entries to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Create a rate limit response with appropriate headers
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${result.resetIn} seconds.`,
      retryAfter: result.resetIn,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': result.resetIn.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetIn.toString(),
      },
    }
  );
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.resetIn.toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Pre-configured rate limiters for common use cases
export const RATE_LIMITS = {
  /** Strict limit for authentication endpoints: 5 requests per minute */
  AUTH: { maxRequests: 5, windowSeconds: 60, keyPrefix: 'auth' },
  
  /** Standard API limit: 30 requests per minute */
  API: { maxRequests: 30, windowSeconds: 60, keyPrefix: 'api' },
  
  /** Relaxed limit for read operations: 100 requests per minute */
  READ: { maxRequests: 100, windowSeconds: 60, keyPrefix: 'read' },
  
  /** Very strict limit for sensitive operations: 3 requests per 5 minutes */
  SENSITIVE: { maxRequests: 3, windowSeconds: 300, keyPrefix: 'sensitive' },
} as const;
