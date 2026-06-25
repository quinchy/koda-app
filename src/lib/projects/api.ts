import type { CreateProjectInput } from "@/lib/validations/project";
import type { SerializedProject } from "./types";

export const projectKeys = {
  all: ["projects"] as const,
};

async function parseError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return body?.error ?? "Something went wrong.";
}

export async function fetchProjects(): Promise<SerializedProject[]> {
  const response = await fetch("/api/projects");

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function createProject(
  input: CreateProjectInput,
): Promise<SerializedProject> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateProject(
  id: number,
  input: CreateProjectInput,
): Promise<SerializedProject> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function deleteProject(id: number) {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}
