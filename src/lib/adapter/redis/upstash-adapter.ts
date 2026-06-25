import { Redis } from "@upstash/redis";
import type { RedisAdapter } from "./types";

export function createUpstashAdapter(url: string, token: string): RedisAdapter {
  const client = new Redis({ url, token });

  return {
    upstash: client,
    get: <T>(key: string) => client.get<T>(key),
    set: async (key, value, options) => {
      if (options?.ex) {
        await client.set(key, value, { ex: options.ex });
        return;
      }
      await client.set(key, value);
    },
    del: async (key) => {
      await client.del(key);
    },
    async delByPrefix(prefix) {
      let cursor: string | number = 0;

      while (true) {
        const [nextCursor, keys] = (await client.scan(cursor, {
          match: `${prefix}*`,
          count: 100,
        })) as [string, string[]];

        if (keys.length > 0) {
          await client.del(...keys);
        }

        if (nextCursor === "0") {
          break;
        }

        cursor = nextCursor;
      }
    },
  };
}
