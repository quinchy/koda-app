import type { Project } from "../../../prisma/generated/client";

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function serializeProject(project: Project) {
  return {
    id: project.id,
    clientName: project.clientName,
    projectName: project.projectName,
    description: project.description,
    status: project.status,
    priority: project.priority,
    startDate: formatDateOnly(project.startDate),
    dueDate: formatDateOnly(project.dueDate),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
