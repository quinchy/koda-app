import type { CreateProjectInput } from "@/lib/validations/project";
import type { SerializedProject } from "./types";

export const projectKeys = {
  all: ["projects"] as const,
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return body?.error ?? "Something went wrong.";
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchProjects(): Promise<SerializedProject[]> {
  return request("/api/projects");
}

export async function createProject(
  input: CreateProjectInput,
): Promise<SerializedProject> {
  return request("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateProject(
  id: number,
  input: CreateProjectInput,
): Promise<SerializedProject> {
  return request(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteProject(id: number) {
  return request<void>(`/api/projects/${id}`, {
    method: "DELETE",
  });
}
