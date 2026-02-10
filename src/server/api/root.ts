import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { itemRouter } from "@/server/api/routers/item";
import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
	item: itemRouter,
	user: userRouter,
});

export type AppRouter = typeof appRouter;
export type TRPCInputs = inferRouterInputs<AppRouter>;
export type TRPCOutputs = inferRouterOutputs<AppRouter>;

export const createCaller = createCallerFactory(appRouter);
