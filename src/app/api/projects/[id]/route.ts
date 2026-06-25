import { NextResponse } from "next/server";
import { handleApiError, parseProjectId } from "@/lib/api/errors";
import { requireSession } from "@/lib/api/require-session";
import {
  invalidateProjectCache,
  readProjectThroughCache,
  setCachedProject,
} from "@/lib/cache/project-cache";
import { serializeProject } from "@/lib/projects/serialize-project";
import {
  checkProjectIpRateLimit,
  checkProjectReadRateLimit,
  checkProjectWriteRateLimit,
} from "@/lib/rate-limit";
import { projectService } from "@/lib/services/project-service";
import { updateProjectSchema } from "@/lib/validations/project";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

    const { id: rawId } = await context.params;
    const id = parseProjectId(rawId);
    const project = await readProjectThroughCache(
      session.user.id,
      id,
      async () => {
        const row = await projectService.getProject(id, session.user.id);
        return serializeProject(row);
      },
    );

    return NextResponse.json(project);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
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

    const { id: rawId } = await context.params;
    const id = parseProjectId(rawId);
    const body = await request.json();
    const input = updateProjectSchema.parse(body);
    const project = await projectService.updateProject(
      id,
      session.user.id,
      input,
    );
    const serialized = serializeProject(project);

    await invalidateProjectCache(session.user.id, id);
    await setCachedProject(session.user.id, serialized);

    return NextResponse.json(serialized);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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

    const { id: rawId } = await context.params;
    const id = parseProjectId(rawId);
    await projectService.deleteProject(id, session.user.id);
    await invalidateProjectCache(session.user.id, id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
