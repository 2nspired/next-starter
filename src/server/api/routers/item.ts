import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createItemSchema, updateItemSchema } from "@/lib/schemas/item-schemas";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { itemService } from "@/server/services/item-service";

export const itemRouter = createTRPCRouter({
	list: protectedProcedure.query(async ({ ctx }) => {
		const result = await itemService.list(ctx.session.user.id);
		if (!result.success) {
			throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error.message });
		}
		return result.data;
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const result = await itemService.getById(ctx.session.user.id, input.id);
			if (!result.success) {
				throw new TRPCError({ code: "NOT_FOUND", message: result.error.message });
			}
			return result.data;
		}),

	create: protectedProcedure.input(createItemSchema).mutation(async ({ ctx, input }) => {
		const result = await itemService.create(ctx.session.user.id, input);
		if (!result.success) {
			throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error.message });
		}
		return result.data;
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string().uuid(), data: updateItemSchema }))
		.mutation(async ({ ctx, input }) => {
			const result = await itemService.update(ctx.session.user.id, input.id, input.data);
			if (!result.success) {
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error.message });
			}
			return result.data;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const result = await itemService.delete(ctx.session.user.id, input.id);
			if (!result.success) {
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error.message });
			}
			return result.data;
		}),
});
