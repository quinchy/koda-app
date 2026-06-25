import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireSession } from "@/lib/api/require-session";
import {
  invalidateProjectCache,
  readProjectListThroughCache,
} from "@/lib/cache/project-cache";
import { serializeProject } from "@/lib/projects/serialize-project";
import {
  checkProjectIpRateLimit,
  checkProjectReadRateLimit,
  checkProjectWriteRateLimit,
} from "@/lib/rate-limit";
import { projectService } from "@/lib/services/project-service";
import { createProjectSchema } from "@/lib/validations/project";
import { projectListQuerySchema } from "@/lib/validations/project-list-query";

export async function GET(request: Request) {
  try {
    const ipLimit = await checkProjectIpRateLimit();
    if (!ipLimit.allowed) {
      return ipLimit.response;
    }

    const session = await requireSession();
    const readLimit = await checkProjectReadRateLimit(session.user.id);
    if (!readLimit.allowed) {
      return readLimit.response;
    }

    const { searchParams } = new URL(request.url);
    const query = projectListQuerySchema.parse({
      q: searchParams.get("q")?.trim() || undefined,
      status: searchParams.get("status") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    });
    const projects = await readProjectListThroughCache(
      session.user.id,
      query,
      async () => {
        const rows = await projectService.listProjects(session.user.id, query);
        return rows.map(serializeProject);
      },
    );

    return NextResponse.json(projects);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ipLimit = await checkProjectIpRateLimit();
    if (!ipLimit.allowed) {
      return ipLimit.response;
    }

    const session = await requireSession();
    const writeLimit = await checkProjectWriteRateLimit(session.user.id);
    if (!writeLimit.allowed) {
      return writeLimit.response;
    }

    const body = await request.json();
    const input = createProjectSchema.parse(body);
    const project = await projectService.createProject(session.user.id, input);
    const serialized = serializeProject(project);

    await invalidateProjectCache(session.user.id);

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
