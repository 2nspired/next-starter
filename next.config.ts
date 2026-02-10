import type { NextConfig } from "next";

/**
 * Import env to validate environment variables at build time.
 * @see src/env.ts for the schema definition
 */
import "./src/env";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.supabase.co",
				pathname: "/storage/v1/object/public/**",
			},
		],
	},

	typedRoutes: true,

	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},

	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
				],
			},
		];
	},
};

export default nextConfig;
