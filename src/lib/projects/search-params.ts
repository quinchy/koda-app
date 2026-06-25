"use client";

import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import type { ProjectPriority, ProjectStatus } from "@/lib/projects/types";
import {
  PROJECT_SORT_VALUES,
  type ProjectListParams,
  type ProjectSort,
} from "@/lib/validations/project-list-query";

const STATUS_FILTER_VALUES = [
  "all",
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
] as const;

const PRIORITY_FILTER_VALUES = ["all", "LOW", "MEDIUM", "HIGH"] as const;

export type ProjectSearchParams = {
  q: string;
  status: (typeof STATUS_FILTER_VALUES)[number];
  priority: (typeof PRIORITY_FILTER_VALUES)[number];
  sort: ProjectSort;
};

export const SEARCH_DEBOUNCE_MS = 300;

export const projectSearchParamsParsers = {
  q: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  status: parseAsStringLiteral(STATUS_FILTER_VALUES)
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  priority: parseAsStringLiteral(PRIORITY_FILTER_VALUES)
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  sort: parseAsStringLiteral(PROJECT_SORT_VALUES)
    .withDefault("newest")
    .withOptions({ clearOnDefault: true }),
};

export function useProjectSearchParams() {
  return useQueryStates(projectSearchParamsParsers);
}

export function toProjectListQuery(
  params: ProjectSearchParams,
): ProjectListParams {
  return {
    q: params.q || undefined,
    status: params.status === "all" ? undefined : params.status,
    priority: params.priority === "all" ? undefined : params.priority,
    sort: params.sort,
  };
}

export function hasActiveProjectFilters(params: ProjectListParams) {
  return Boolean(
    params.q ||
      params.status ||
      params.priority ||
      (params.sort && params.sort !== "newest"),
  );
}

export const SORT_OPTIONS: ReadonlyArray<{
  value: ProjectSort;
  label: string;
}> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "dueDate", label: "Due date (earliest)" },
  { value: "dueDateDesc", label: "Due date (latest)" },
  { value: "priorityDesc", label: "Priority (high to low)" },
  { value: "priority", label: "Priority (low to high)" },
  { value: "status", label: "Status" },
  { value: "name", label: "Project name (A-Z)" },
];

export const STATUS_FILTER_OPTIONS: ReadonlyArray<{
  value: ProjectSearchParams["status"];
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
];

export const PRIORITY_FILTER_OPTIONS: ReadonlyArray<{
  value: ProjectSearchParams["priority"];
  label: string;
}> = [
  { value: "all", label: "All priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export function getSortLabel(sort: ProjectSort) {
  return SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Sort";
}

export function getStatusFilterLabel(status: ProjectSearchParams["status"]) {
  return (
    STATUS_FILTER_OPTIONS.find((option) => option.value === status)?.label ??
    "All statuses"
  );
}

export function getPriorityFilterLabel(
  priority: ProjectSearchParams["priority"],
) {
  return (
    PRIORITY_FILTER_OPTIONS.find((option) => option.value === priority)
      ?.label ?? "All priorities"
  );
}

export type { ProjectStatus, ProjectPriority };
