import type { User as SupabaseUser, UserAppMetadata } from "@supabase/supabase-js";
import type { UserProfile as FullUserProfile } from "prisma/generated/client";
import { cache } from "react";
import "server-only";
import { db } from "@/server/db";
import { supabaseServerClient } from "@/utilities/supabase/server";

type UserProfile = Pick<FullUserProfile, "id" | "email" | "displayName">;

export type User = SupabaseUser & {
	email: string;
	profile: UserProfile;
	app_metadata: UserAppMetadata & {
		providers: string[];
	};
};

export type Auth = {
	user: User | null;
	isLoggedIn: boolean;
};

export async function getSessionUser() {
	// Skip when Supabase is not configured (allows dev server to boot without env vars)
	if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
		return null;
	}

	const supabase = await supabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user ?? null;
}

export const getUserProfile = cache(async (userId: string) => {
	return db.userProfile.findUnique({
		where: { id: userId },
		select: { id: true, email: true, displayName: true },
	});
});

export async function getAuth() {
	const user = await getSessionUser();
	if (!user) {
		return {
			user: null,
			isLoggedIn: false as const,
		};
	}
	const profile = await getUserProfile(user.id);
	if (!profile) {
		return {
			user: null,
			isLoggedIn: false as const,
		};
	}
	return {
		user: { ...user, profile } as User,
		isLoggedIn: true as const,
	};
}
