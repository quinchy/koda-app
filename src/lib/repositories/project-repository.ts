import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../prisma/generated/client";

export class ProjectRepository {
  findMany() {
    return prisma.project.findMany({
      orderBy: { createdAt: "desc" },
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
