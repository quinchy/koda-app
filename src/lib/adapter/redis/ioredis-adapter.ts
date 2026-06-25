import IoRedis from "ioredis";
import type { RedisAdapter } from "./types";

function serialize(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function deserialize<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as T;
  }
}

export function createIoredisAdapter(url: string): RedisAdapter {
  const client = new IoRedis(url, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  client.on("error", (error) => {
    console.error(
      `[redis] ioredis error: ${error instanceof Error ? error.message : String(error)}`,
    );
  });

  void client.connect().catch(() => undefined);

  return {
    upstash: null,
    async get<T>(key: string): Promise<T | null> {
      const raw = await client.get(key);
      if (raw === null) {
        return null;
      }
      return deserialize<T>(raw);
    },
    async set(key, value, options) {
      const payload = serialize(value);
      if (options?.ex) {
        await client.set(key, payload, "EX", options.ex);
        return;
      }
      await client.set(key, payload);
    },
    async del(key) {
      await client.del(key);
    },
    async delByPrefix(prefix) {
      let cursor = "0";

      do {
        const [nextCursor, keys] = await client.scan(
          cursor,
          "MATCH",
          `${prefix}*`,
          "COUNT",
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } while (cursor !== "0");
    },
  };
}
