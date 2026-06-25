import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireSession } from "@/lib/api/require-session";
import { serializeProject } from "@/lib/projects/serialize-project";
import { projectService } from "@/lib/services/project-service";
import { createProjectSchema } from "@/lib/validations/project";
import { projectListQuerySchema } from "@/lib/validations/project-list-query";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const query = projectListQuerySchema.parse({
      q: searchParams.get("q")?.trim() || undefined,
      status: searchParams.get("status") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    });
    const projects = await projectService.listProjects(session.user.id, query);

    return NextResponse.json(projects.map(serializeProject));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = createProjectSchema.parse(body);
    const project = await projectService.createProject(session.user.id, input);

    return NextResponse.json(serializeProject(project), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
