import { z } from "zod";

export const PROJECT_SORT_VALUES = [
  "newest",
  "oldest",
  "dueDate",
  "dueDateDesc",
  "priority",
  "priorityDesc",
  "status",
  "name",
] as const;

export type ProjectSort = (typeof PROJECT_SORT_VALUES)[number];

export const projectListQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z
    .enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED"])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  sort: z.enum(PROJECT_SORT_VALUES).optional().default("newest"),
});

export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;

export type ProjectListParams = {
  q?: string;
  status?: ProjectListQuery["status"];
  priority?: ProjectListQuery["priority"];
  sort?: ProjectSort;
};
