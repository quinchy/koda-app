import { z } from "zod";

const statusSchema = z.enum([
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
]);

const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

const dateSchema = z.iso.date("Date must be YYYY-MM-DD");

const projectBodySchema = z.object({
  clientName: z.string().trim().min(1, "Client name is required"),
  projectName: z.string().trim().min(1, "Project name is required"),
  description: z.string().optional().nullable(),
  status: statusSchema,
  priority: prioritySchema,
  startDate: dateSchema,
  dueDate: dateSchema,
});

const dueDateAfterStartDate = (
  data: { startDate: string; dueDate: string },
  ctx: z.RefinementCtx,
) => {
  if (data.dueDate < data.startDate) {
    ctx.addIssue({
      code: "custom",
      message: "Due date cannot be earlier than start date",
      path: ["dueDate"],
    });
  }
};

export const createProjectSchema = projectBodySchema.superRefine(
  dueDateAfterStartDate,
);

export const updateProjectSchema = projectBodySchema
  .partial()
  .superRefine((data, ctx) => {
    if (data.startDate && data.dueDate) {
      dueDateAfterStartDate(
        { startDate: data.startDate, dueDate: data.dueDate },
        ctx,
      );
    }
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export function toProjectDates(input: { startDate: string; dueDate: string }) {
  return {
    startDate: new Date(`${input.startDate}T00:00:00.000Z`),
    dueDate: new Date(`${input.dueDate}T00:00:00.000Z`),
  };
}
