import { NotFoundError, ValidationError } from "@/lib/api/errors";
import { projectRepository } from "@/lib/repositories/project-repository";
import {
  type CreateProjectInput,
  toProjectDates,
  type UpdateProjectInput,
} from "@/lib/validations/project";
import type { ProjectListQuery } from "@/lib/validations/project-list-query";
import { Prisma } from "../../../prisma/generated/client";

function isRecordNotFound(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

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

export class ProjectService {
  listProjects(query: ProjectListQuery) {
    return projectRepository.findMany({
      ...query,
      sort: query.sort ?? "newest",
    });
  }

  async getProject(id: number) {
    const project = await projectRepository.findById(id);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    return project;
  }

  createProject(input: CreateProjectInput) {
    const { startDate, dueDate } = toProjectDates(input);

    return projectRepository.create({
      clientName: input.clientName,
      projectName: input.projectName,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      startDate,
      dueDate,
    });
  }

  async updateProject(id: number, input: UpdateProjectInput) {
    const data = buildUpdateData(input);

    if (Object.keys(data).length === 0) {
      return this.getProject(id);
    }

    if (input.startDate !== undefined || input.dueDate !== undefined) {
      const existing = await this.getProject(id);
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

    try {
      return await projectRepository.update(id, data);
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new NotFoundError("Project not found");
      }

      throw error;
    }
  }

  async deleteProject(id: number) {
    try {
      await projectRepository.delete(id);
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new NotFoundError("Project not found");
      }

      throw error;
    }
  }
}

export const projectService = new ProjectService();
