import { z } from "zod";

export const formFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "date", "datetime", "email"]),
  required: z.boolean().optional(),
});

export const saveFormSettingsSchema = z.object({
  fields: z.array(formFieldSchema).min(1),
});

export type SaveFormSettingsInput = z.infer<typeof saveFormSettingsSchema>;
