import { NotFoundError, ValidationError } from "@/lib/api/errors";
import { projectRepository } from "@/lib/repositories/project-repository";
import {
  type CreateProjectInput,
  toProjectDates,
  type UpdateProjectInput,
} from "@/lib/validations/project";
import type { ProjectListQuery } from "@/lib/validations/project-list-query";
import type { Prisma } from "../../../prisma/generated/client";

function assertDueDateOnOrAfterStartDate(startDate: Date, dueDate: Date) {
  if (dueDate < startDate) {
    throw new ValidationError("Due date cannot be earlier than start date");
  }
}

function buildUpdateData(input: UpdateProjectInput) {
  const data: Prisma.ProjectUpdateInput = {};

  if (input.clientName !== undefined) {
    data.clientName = input.clientName;
  }

  if (input.projectName !== undefined) {
    data.projectName = input.projectName;
  }

  if (input.description !== undefined) {
    data.description = input.description;
  }

  if (input.status !== undefined) {
    data.status = input.status;
  }

  if (input.priority !== undefined) {
    data.priority = input.priority;
  }

  if (input.startDate !== undefined) {
    data.startDate = new Date(`${input.startDate}T00:00:00.000Z`);
  }

  if (input.dueDate !== undefined) {
    data.dueDate = new Date(`${input.dueDate}T00:00:00.000Z`);
  }

  return data;
}

class ProjectService {
  listProjects(userId: string, query: ProjectListQuery) {
    return projectRepository.findMany(
      {
        ...query,
        sort: query.sort ?? "newest",
      },
      userId,
    );
  }

  async getProject(id: number, userId: string) {
    const project = await projectRepository.findById(id, userId);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    return project;
  }

  createProject(userId: string, input: CreateProjectInput) {
    const { startDate, dueDate } = toProjectDates(input);

    return projectRepository.create({
      clientName: input.clientName,
      projectName: input.projectName,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      startDate,
      dueDate,
      user: { connect: { id: userId } },
    });
  }

  async updateProject(id: number, userId: string, input: UpdateProjectInput) {
    const data = buildUpdateData(input);

    if (Object.keys(data).length === 0) {
      return this.getProject(id, userId);
    }

    if (input.startDate !== undefined || input.dueDate !== undefined) {
      const existing = await this.getProject(id, userId);
      const startDate =
        input.startDate !== undefined
          ? new Date(`${input.startDate}T00:00:00.000Z`)
          : existing.startDate;
      const dueDate =
        input.dueDate !== undefined
          ? new Date(`${input.dueDate}T00:00:00.000Z`)
          : existing.dueDate;

      assertDueDateOnOrAfterStartDate(startDate, dueDate);
    }

    const project = await projectRepository.update(id, userId, data);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    return project;
  }

  async deleteProject(id: number, userId: string) {
    const deleted = await projectRepository.delete(id, userId);

    if (!deleted) {
      throw new NotFoundError("Project not found");
    }
  }
}

export const projectService = new ProjectService();
