import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userService } from "@/server/services/user-service";

export const userRouter = createTRPCRouter({
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		return await userService.getUserProfile(ctx.session.user.id);
	}),
});
