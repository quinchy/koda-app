export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED";

export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH";

export type SerializedProject = {
  id: number;
  clientName: string;
  projectName: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};
