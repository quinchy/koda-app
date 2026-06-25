import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { requireSession } from "@/lib/api/require-session";
import { serializeProject } from "@/lib/projects/serialize-project";
import { projectService } from "@/lib/services/project-service";
import { createProjectSchema } from "@/lib/validations/project";

export async function GET() {
  try {
    await requireSession();
    const projects = await projectService.listProjects();

    return NextResponse.json(projects.map(serializeProject));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = await request.json();
    const input = createProjectSchema.parse(body);
    const project = await projectService.createProject(input);

    return NextResponse.json(serializeProject(project), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
