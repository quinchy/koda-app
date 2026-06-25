import { Ratelimit } from "@upstash/ratelimit";
import type { Redis as UpstashRedis } from "@upstash/redis";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/adapter/redis";
import {
  PROJECT_IP_RATE_LIMIT,
  PROJECT_READ_RATE_LIMIT,
  PROJECT_WRITE_RATE_LIMIT,
} from "@/lib/config/rate-limits";

const upstashLimiters = new Map<string, Ratelimit>();
const inMemoryStore = new Map<string, number[]>();

interface RateLimitConfig {
  max: number;
  prefix: string;
  windowMs: number;
}

interface RateLimitResult {
  remaining: number;
  reset: Date;
  success: boolean;
}

function inMemoryRateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (inMemoryStore.get(key) ?? []).filter(
    (t) => t > windowStart,
  );

  if (timestamps.length >= max) {
    inMemoryStore.set(key, timestamps);
    return {
      success: false,
      remaining: 0,
      reset: new Date(timestamps[0] + windowMs),
    };
  }

  timestamps.push(now);
  inMemoryStore.set(key, timestamps);
  return {
    success: true,
    remaining: max - timestamps.length,
    reset: new Date(now + windowMs),
  };
}

function getUpstashLimiter(
  redis: UpstashRedis,
  max: number,
  windowMs: number,
  prefix: string,
): Ratelimit {
  const configKey = `${prefix}:${max}:${windowMs}`;
  const existing = upstashLimiters.get(configKey);
  if (existing) {
    return existing;
  }

  const windowSec = Math.max(Math.ceil(windowMs / 1000), 1);
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
    prefix,
    analytics: false,
  });
  upstashLimiters.set(configKey, limiter);
  return limiter;
}

async function consumeRateLimit(
  identifier: string,
  { max, prefix, windowMs }: RateLimitConfig,
): Promise<RateLimitResult> {
  const key = `${prefix}:${identifier}`;

  try {
    const upstash = getRedis()?.upstash;
    if (upstash) {
      const limiter = getUpstashLimiter(upstash, max, windowMs, prefix);
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        reset: new Date(result.reset),
      };
    }
  } catch {
    // Fall through to in-memory when Upstash is unavailable.
  }

  return inMemoryRateLimit(key, max, windowMs);
}

async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  return (
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown"
  );
}

function rateLimitedResponse(
  result: RateLimitResult,
  max: number,
): NextResponse {
  const retryAfterSec = Math.max(
    Math.ceil((result.reset.getTime() - Date.now()) / 1000),
    1,
  );

  return NextResponse.json(
    {
      error: "Too many requests. Please wait and try again.",
      retryAfter: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Limit": String(max),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": result.reset.toISOString(),
      },
    },
  );
}

async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<{ allowed: true } | { allowed: false; response: NextResponse }> {
  const result = await consumeRateLimit(identifier, config);

  if (!result.success) {
    return {
      allowed: false,
      response: rateLimitedResponse(result, config.max),
    };
  }

  return { allowed: true };
}

export async function checkProjectIpRateLimit() {
  return checkRateLimit(await getClientIp(), PROJECT_IP_RATE_LIMIT);
}

export async function checkProjectReadRateLimit(userId: string) {
  return checkRateLimit(userId, PROJECT_READ_RATE_LIMIT);
}

export async function checkProjectWriteRateLimit(userId: string) {
  return checkRateLimit(userId, PROJECT_WRITE_RATE_LIMIT);
}
