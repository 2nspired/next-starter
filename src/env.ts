import { createEnv } from "@t3-oss/env-nextjs";

import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
		SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
		DATABASE_URL: z.string().min(1),
		DIRECT_URL: z.string().min(1).default("test"),
	},

	client: {
		NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
		NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
		NEXT_PUBLIC_SITE_URL: z.string().min(1),
	},

	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
		DATABASE_URL: process.env.DATABASE_URL,
		DIRECT_URL: process.env.DIRECT_URL,
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_SITE_URL:
			process.env.NEXT_PUBLIC_SITE_URL ||
			(process.env.NEXT_PUBLIC_VERCEL_URL
				? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
				: "http://localhost:3000"),
	},

	skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "development",
	emptyStringAsUndefined: true,
});
