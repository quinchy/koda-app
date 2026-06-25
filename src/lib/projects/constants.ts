import type {
  ProjectPriority,
  ProjectStatus,
  SerializedProject,
} from "./types";

export const STATUS_OPTIONS: ReadonlyArray<{
  value: ProjectStatus;
  label: string;
}> = [
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
];

export const PRIORITY_OPTIONS: ReadonlyArray<{
  value: ProjectPriority;
  label: string;
}> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ProjectStatus, string>;

export const STATUS_BADGE_CLASSNAME: Record<ProjectStatus, string> = {
  PLANNING:
    "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  IN_PROGRESS:
    "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  ON_HOLD:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  COMPLETED:
    "border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
};

export const PRIORITY_LABELS = Object.fromEntries(
  PRIORITY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ProjectPriority, string>;

export const PRIORITY_BADGE_CLASSNAME: Record<ProjectPriority, string> = {
  LOW: "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  MEDIUM:
    "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  HIGH: "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

export const DEFAULT_PROJECT_FORM_VALUES = {
  clientName: "",
  projectName: "",
  status: "PLANNING" as const,
  priority: "MEDIUM" as const,
  startDate: "",
  dueDate: "",
};

export function toProjectFormValues(project: SerializedProject) {
  return {
    clientName: project.clientName,
    projectName: project.projectName,
    description: project.description ?? "",
    status: project.status,
    priority: project.priority,
    startDate: project.startDate,
    dueDate: project.dueDate,
  };
}
