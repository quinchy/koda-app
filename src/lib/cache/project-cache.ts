import { createHash } from "node:crypto";
import { getRedis } from "@/lib/adapter/redis";
import type { SerializedProject } from "@/lib/projects/types";
import type { ProjectListQuery } from "@/lib/validations/project-list-query";

const PROJECT_LIST_CACHE_TTL_SEC = 60;
const PROJECT_ITEM_CACHE_TTL_SEC = 60;

const CACHE_VERSION = "v1";

function listCacheKey(userId: string, query: ProjectListQuery) {
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        priority: query.priority ?? "",
        q: query.q ?? "",
        sort: query.sort ?? "newest",
        status: query.status ?? "",
      }),
    )
    .digest("hex")
    .slice(0, 16);

  return `projects:${CACHE_VERSION}:list:${userId}:${fingerprint}`;
}

function itemCacheKey(userId: string, projectId: number) {
  return `projects:${CACHE_VERSION}:item:${userId}:${projectId}`;
}

function listCachePrefix(userId: string) {
  return `projects:${CACHE_VERSION}:list:${userId}:`;
}

function itemCachePrefix(userId: string) {
  return `projects:${CACHE_VERSION}:item:${userId}:`;
}

async function getCachedProjectList(
  userId: string,
  query: ProjectListQuery,
): Promise<SerializedProject[] | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  try {
    return await redis.get<SerializedProject[]>(listCacheKey(userId, query));
  } catch {
    return null;
  }
}

async function setCachedProjectList(
  userId: string,
  query: ProjectListQuery,
  projects: SerializedProject[],
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  try {
    await redis.set(listCacheKey(userId, query), projects, {
      ex: PROJECT_LIST_CACHE_TTL_SEC,
    });
  } catch {
    // Cache write failures must not break the API.
  }
}

async function getCachedProject(
  userId: string,
  projectId: number,
): Promise<SerializedProject | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  try {
    return await redis.get<SerializedProject>(itemCacheKey(userId, projectId));
  } catch {
    return null;
  }
}

export async function setCachedProject(
  userId: string,
  project: SerializedProject,
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  try {
    await redis.set(itemCacheKey(userId, project.id), project, {
      ex: PROJECT_ITEM_CACHE_TTL_SEC,
    });
  } catch {
    // Cache write failures must not break the API.
  }
}

/** Drop list caches for the user and optionally one project item cache. */
export async function invalidateProjectCache(
  userId: string,
  projectId?: number,
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  try {
    await redis.delByPrefix(listCachePrefix(userId));

    if (projectId !== undefined) {
      await redis.del(itemCacheKey(userId, projectId));
      return;
    }

    await redis.delByPrefix(itemCachePrefix(userId));
  } catch {
    // Invalidation failures must not break mutations.
  }
}

export async function readProjectListThroughCache(
  userId: string,
  query: ProjectListQuery,
  load: () => Promise<SerializedProject[]>,
): Promise<SerializedProject[]> {
  const cached = await getCachedProjectList(userId, query);
  if (cached) {
    return cached;
  }

  const fresh = await load();
  await setCachedProjectList(userId, query, fresh);
  return fresh;
}

export async function readProjectThroughCache(
  userId: string,
  projectId: number,
  load: () => Promise<SerializedProject>,
): Promise<SerializedProject> {
  const cached = await getCachedProject(userId, projectId);
  if (cached) {
    return cached;
  }

  const fresh = await load();
  await setCachedProject(userId, fresh);
  return fresh;
}
