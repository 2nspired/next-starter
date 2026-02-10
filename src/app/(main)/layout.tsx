import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-dvh flex-col">
			<header className="border-b">
				<div className="container mx-auto flex h-14 items-center justify-between px-4">
					<Link href="/dashboard" className="text-lg font-semibold">
						Next Starter
					</Link>
					<LogoutButton />
				</div>
			</header>
			<main className="flex-1">
				<div className="container mx-auto px-4 py-6">{children}</div>
			</main>
		</div>
	);
}
