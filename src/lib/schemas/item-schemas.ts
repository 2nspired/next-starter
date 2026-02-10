import { z } from "zod";

export const createItemSchema = z.object({
	title: z.string().min(1, "Title is required.").max(200, "Title is too long."),
	description: z.string().max(1000, "Description is too long.").optional(),
});

export const updateItemSchema = z.object({
	title: z.string().min(1, "Title is required.").max(200, "Title is too long.").optional(),
	description: z.string().max(1000, "Description is too long.").optional(),
	completed: z.boolean().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
