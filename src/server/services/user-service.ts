import { db } from "@/server/db";

async function getUserProfile(userId: string) {
	return db.userProfile.findUnique({
		where: { id: userId },
		select: { id: true, email: true, displayName: true, createdAt: true },
	});
}

export const userService = {
	getUserProfile,
};
