/**
 * tRPC server setup — context, initialization, procedures.
 *
 * You probably don't need to edit this file unless:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 */
import { initTRPC, TRPCError } from "@trpc/server";

import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/server/db";
import { supabaseServerClient } from "@/utilities/supabase/server";

/**
 * 1. CONTEXT
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
	const supabase = await supabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return {
		db,
		session: { user },
		...opts,
	};
};

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		};
	},
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

/**
 * 3. PROCEDURES
 */

const timingMiddleware = t.middleware(async ({ next, path }) => {
	const start = Date.now();

	if (t._config.isDev) {
		const waitMs = Math.floor(Math.random() * 400) + 100;
		await new Promise((resolve) => setTimeout(resolve, waitMs));
	}

	const result = await next();

	const end = Date.now();
	console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

	return result;
});

/** Public (unauthenticated) procedure */
export const publicProcedure = t.procedure.use(timingMiddleware);

/** Protected (authenticated) procedure — guarantees `ctx.session.user` is not null */
export const protectedProcedure = t.procedure.use(timingMiddleware).use(({ ctx, next }) => {
	if (!ctx.session?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next({
		ctx: {
			...ctx,
			session: { ...ctx.session, user: ctx.session.user },
		},
	});
});
