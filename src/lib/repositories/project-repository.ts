import { prisma } from "@/lib/prisma";
import type {
  ProjectListQuery,
  ProjectSort,
} from "@/lib/validations/project-list-query";
import type { Prisma } from "../../../prisma/generated/client";

function buildWhere(
  query: ProjectListQuery,
  userId: string,
): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = { userId };

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

class ProjectRepository {
  findMany(query: ProjectListQuery, userId: string) {
    return prisma.project.findMany({
      where: buildWhere(query, userId),
      orderBy: buildOrderBy(query.sort),
    });
  }

  findById(id: number, userId: string) {
    return prisma.project.findFirst({
      where: { id, userId },
    });
  }

  create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({ data });
  }

  async update(id: number, userId: string, data: Prisma.ProjectUpdateInput) {
    const result = await prisma.project.updateMany({
      where: { id, userId },
      data,
    });

    if (result.count === 0) {
      return null;
    }

    return prisma.project.findUnique({
      where: { id },
    });
  }

  async delete(id: number, userId: string) {
    const result = await prisma.project.deleteMany({
      where: { id, userId },
    });

    return result.count > 0;
  }
}

export const projectRepository = new ProjectRepository();
