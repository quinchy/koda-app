import { createIoredisAdapter } from "./ioredis-adapter";
import type { RedisAdapter } from "./types";
import { createUpstashAdapter } from "./upstash-adapter";

let adapter: RedisAdapter | null = null;
let checked = false;
let statusLogged = false;

type RedisMode = "none" | "upstash-rest" | "ioredis";

function logRedisStatus(mode: RedisMode, details?: Record<string, unknown>) {
  if (statusLogged) {
    return;
  }
  statusLogged = true;

  const suffix = details ? ` ${JSON.stringify(details)}` : "";
  if (mode === "none") {
    console.warn(`[redis] status=disabled mode=${mode}${suffix}`);
    return;
  }

  console.info(`[redis] status=configured mode=${mode}${suffix}`);
}

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/**
 * Shared Redis adapter. Picks transport from env (not NODE_ENV):
 * 1. `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` → Upstash REST
 * 2. `REDIS_URL` (`redis://` / `rediss://`) → ioredis (local Docker)
 * 3. missing / unsupported → null (cache no-ops)
 */
export function getRedis(): RedisAdapter | null {
  if (checked) {
    return adapter;
  }
  checked = true;

  const upstashUrl = readEnv("UPSTASH_REDIS_REST_URL");
  const upstashToken = readEnv("UPSTASH_REDIS_REST_TOKEN");

  if (upstashUrl?.startsWith("https://") && upstashToken) {
    try {
      adapter = createUpstashAdapter(upstashUrl, upstashToken);
      logRedisStatus("upstash-rest");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[redis] status=error mode=upstash-rest message=${message}`,
      );
    }
    return adapter;
  }

  const redisUrl = readEnv("REDIS_URL");

  if (redisUrl?.startsWith("redis://") || redisUrl?.startsWith("rediss://")) {
    try {
      adapter = createIoredisAdapter(redisUrl);
      logRedisStatus("ioredis");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[redis] status=error mode=ioredis message=${message}`);
    }
    return adapter;
  }

  if (upstashUrl && !upstashToken) {
    logRedisStatus("none", { reason: "missing-upstash-token" });
    return adapter;
  }

  logRedisStatus("none", { reason: "missing-url" });
  return adapter;
}

export function resetRedisForTests(): void {
  adapter = null;
  checked = false;
  statusLogged = false;
}
