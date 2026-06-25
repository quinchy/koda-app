import type { Redis as UpstashRedis } from "@upstash/redis";

export interface RedisAdapter {
  del(key: string): Promise<void>;
  delByPrefix(prefix: string): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, options?: { ex?: number }): Promise<void>;
  /** Raw Upstash client for @upstash/ratelimit; null when using ioredis. */
  upstash: UpstashRedis | null;
}
