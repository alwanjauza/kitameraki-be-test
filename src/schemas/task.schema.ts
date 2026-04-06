import { z } from "zod";

export const createTaskSchema = z.object({
  organizationId: z
    .string({ required_error: "OrganizationId is required" })
    .min(1, "OrganizationId is required"),
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "done"], {
    required_error: "Status is required",
  }),
  dueDate: z.string().optional(),
  customFields: z.record(z.any()).optional().default({}),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(["todo", "in-progress", "done"]).optional(),
    dueDate: z.string().datetime().optional(),
    customFields: z.record(z.any()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const bulkDeleteSchema = z
  .array(z.string().min(1))
  .min(1, "At least one task id is required");

export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
