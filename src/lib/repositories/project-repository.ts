import { prisma } from "@/lib/prisma";
import type {
  ProjectListQuery,
  ProjectSort,
} from "@/lib/validations/project-list-query";
import type { Prisma } from "../../../prisma/generated/client";

function buildWhere(query: ProjectListQuery): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};

  if (query.q) {
    where.OR = [
      { clientName: { contains: query.q, mode: "insensitive" } },
      { projectName: { contains: query.q, mode: "insensitive" } },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  return where;
}

function buildOrderBy(
  sort: ProjectSort,
): Prisma.ProjectOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "dueDate":
      return { dueDate: "asc" };
    case "dueDateDesc":
      return { dueDate: "desc" };
    case "priority":
      return { priority: "asc" };
    case "priorityDesc":
      return { priority: "desc" };
    case "status":
      return { status: "asc" };
    case "name":
      return { projectName: "asc" };
    default:
      return { createdAt: "desc" };
  }
}

export class ProjectRepository {
  findMany(query: ProjectListQuery) {
    return prisma.project.findMany({
      where: buildWhere(query),
      orderBy: buildOrderBy(query.sort),
    });
  }

  findById(id: number) {
    return prisma.project.findUnique({
      where: { id },
    });
  }

  create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({ data });
  }

  update(id: number, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  delete(id: number) {
    return prisma.project.delete({
      where: { id },
    });
  }
}

export const projectRepository = new ProjectRepository();
