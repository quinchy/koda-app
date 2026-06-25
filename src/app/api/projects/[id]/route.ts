import { NextResponse } from "next/server";
import { handleApiError, parseProjectId } from "@/lib/api/errors";
import { serializeProject } from "@/lib/projects/serialize-project";
import { projectService } from "@/lib/services/project-service";
import { updateProjectSchema } from "@/lib/validations/project";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseProjectId(rawId);
    const project = await projectService.getProject(id);

    return NextResponse.json(serializeProject(project));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseProjectId(rawId);
    const body = await request.json();
    const input = updateProjectSchema.parse(body);
    const project = await projectService.updateProject(id, input);

    return NextResponse.json(serializeProject(project));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseProjectId(rawId);
    await projectService.deleteProject(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
