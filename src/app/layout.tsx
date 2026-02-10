import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { AuthProvider } from "@/components/auth/auth-provider";
import { BreakpointIndicator } from "@/components/dev/breakpoint-indicator";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { getAuth } from "@/utilities/auth/server";

import "./globals.css";

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export const metadata: Metadata = {
	title: {
		template: "%s - Next Starter",
		default: "Next Starter",
	},
	description: "A full-stack Next.js starter template",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const auth = getAuth();

	return (
		<html lang="en" className={`${geist.variable} antialiased`} suppressHydrationWarning>
			<body className="min-h-dvh bg-background">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<AuthProvider loggedIn={auth}>
						<TRPCReactProvider>
							{children}
							<Toaster />
						</TRPCReactProvider>
					</AuthProvider>
				</ThemeProvider>
				<BreakpointIndicator />
			</body>
		</html>
	);
}
