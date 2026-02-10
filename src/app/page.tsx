import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4">
			<div className="text-center">
				<h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Next Starter</h1>
				<p className="mt-4 text-lg text-muted-foreground">
					Full-stack Next.js template with Supabase, tRPC, and Prisma.
				</p>
			</div>
			<div className="flex gap-3">
				<Button asChild>
					<Link href="/login">Get Started</Link>
				</Button>
				<Button variant="outline" asChild>
					<Link href="/signup">Sign Up</Link>
				</Button>
			</div>
		</div>
	);
}
