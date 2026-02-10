import type { Item } from "prisma/generated/client";
import type { CreateItemInput, UpdateItemInput } from "@/lib/schemas/item-schemas";
import { db } from "@/server/db";
import type { ServiceResult } from "@/server/services/types/service-result";

async function list(userId: string): Promise<ServiceResult<Item[]>> {
	try {
		const items = await db.item.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});
		return { success: true, data: items };
	} catch (error) {
		console.error("[ITEM_SERVICE] list error:", error);
		return { success: false, error: { code: "LIST_FAILED", message: "Failed to fetch items." } };
	}
}

async function getById(userId: string, itemId: string): Promise<ServiceResult<Item>> {
	try {
		const item = await db.item.findFirst({
			where: { id: itemId, userId },
		});
		if (!item) {
			return { success: false, error: { code: "NOT_FOUND", message: "Item not found." } };
		}
		return { success: true, data: item };
	} catch (error) {
		console.error("[ITEM_SERVICE] getById error:", error);
		return {
			success: false,
			error: { code: "GET_FAILED", message: "Failed to fetch item." },
		};
	}
}

async function create(userId: string, data: CreateItemInput): Promise<ServiceResult<Item>> {
	try {
		const item = await db.item.create({
			data: {
				userId,
				title: data.title,
				description: data.description,
			},
		});
		return { success: true, data: item };
	} catch (error) {
		console.error("[ITEM_SERVICE] create error:", error);
		return {
			success: false,
			error: { code: "CREATE_FAILED", message: "Failed to create item." },
		};
	}
}

async function update(
	userId: string,
	itemId: string,
	data: UpdateItemInput
): Promise<ServiceResult<Item>> {
	try {
		const existing = await db.item.findFirst({
			where: { id: itemId, userId },
		});
		if (!existing) {
			return { success: false, error: { code: "NOT_FOUND", message: "Item not found." } };
		}

		const item = await db.item.update({
			where: { id: itemId },
			data,
		});
		return { success: true, data: item };
	} catch (error) {
		console.error("[ITEM_SERVICE] update error:", error);
		return {
			success: false,
			error: { code: "UPDATE_FAILED", message: "Failed to update item." },
		};
	}
}

async function deleteItem(userId: string, itemId: string): Promise<ServiceResult<Item>> {
	try {
		const existing = await db.item.findFirst({
			where: { id: itemId, userId },
		});
		if (!existing) {
			return { success: false, error: { code: "NOT_FOUND", message: "Item not found." } };
		}

		const item = await db.item.delete({
			where: { id: itemId },
		});
		return { success: true, data: item };
	} catch (error) {
		console.error("[ITEM_SERVICE] delete error:", error);
		return {
			success: false,
			error: { code: "DELETE_FAILED", message: "Failed to delete item." },
		};
	}
}

export const itemService = {
	list,
	getById,
	create,
	update,
	delete: deleteItem,
};
