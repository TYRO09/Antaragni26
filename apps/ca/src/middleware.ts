import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory rate limiting store 
// Note: In a serverless environment like Vercel, this is scoped per edge-node instance. 
// For strict global rate limiting, consider integrating a Redis store like @upstash/ratelimit.
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

// Rate Limiting Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP

export function middleware(request: NextRequest) {
  // Extract the IP address
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown-ip';
  
  // Apply rate limiting exclusively to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    
    // Intermittently clean up old records to prevent memory bloat
    if (Math.random() < 0.05) {
      for (const [key, data] of rateLimitStore.entries()) {
        if (data.timestamp < windowStart) {
          rateLimitStore.delete(key);
        }
      }
    }

    const currentRecord = rateLimitStore.get(ip);

    if (!currentRecord || currentRecord.timestamp < windowStart) {
      // First request from this IP, or the previous window expired
      rateLimitStore.set(ip, { count: 1, timestamp: now });
    } else {
      // IP exists in the current window
      currentRecord.count += 1;
      
      // Check if they exceeded the limit
      if (currentRecord.count > MAX_REQUESTS_PER_WINDOW) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests, please try again later.' }),
          { 
            status: 429, 
            headers: { 
                'Content-Type': 'application/json',
                'Retry-After': '60'
            } 
          }
        );
      }
    }
  }

  // Continue to the intended route if not rate limited
  const response = NextResponse.next();
  return response;
}

// Specify the paths the middleware should intercept
export const config = {
  matcher: '/api/:path*',
};
