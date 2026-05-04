/**
 * Simple in-memory rate limiter for serverless environments.
 * Note: In a distributed Vercel deployment, this state is per-container.
 * For strict global rate limiting, use Redis (e.g., @upstash/ratelimit).
 */

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitTracker>();

export function checkRateLimit(ip: string, limit: number = 50, windowMs: number = 60000): { success: boolean; limit: number; remaining: number } {
  const now = Date.now();
  const tracker = rateLimits.get(ip) || { count: 0, resetTime: now + windowMs };

  // Reset the window if the time has passed
  if (now > tracker.resetTime) {
    tracker.count = 0;
    tracker.resetTime = now + windowMs;
  }

  tracker.count += 1;
  rateLimits.set(ip, tracker);

  // Periodically clean up old entries to prevent memory leaks in long-running containers
  if (rateLimits.size > 10000) {
    for (const [key, val] of rateLimits.entries()) {
      if (now > val.resetTime) {
        rateLimits.delete(key);
      }
    }
  }

  const remaining = Math.max(0, limit - tracker.count);

  return {
    success: tracker.count <= limit,
    limit,
    remaining,
  };
}
