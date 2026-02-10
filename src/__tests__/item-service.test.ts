// Tests for itemService — demonstrates mocking Prisma.
//
// Why mock Prisma?
// Unit tests should be fast and not require a database connection.
// We mock `@/server/db` so that `db.item.findMany()` etc. return fake data
// instead of hitting a real database.

import { beforeEach, describe, expect, it, vi } from "vitest";

// Step 1: Mock the database module.
// vi.mock() replaces the real module with a fake one.
// Any code that imports `@/server/db` will get this mock instead.
vi.mock("@/server/db", () => ({
	db: {
		item: {
			findMany: vi.fn(),
			findFirst: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	},
}));

// Step 2: Import after mocking.
// The import now gets the mocked version of `db`.
import { db } from "@/server/db";
import { itemService } from "@/server/services/item-service";

// Step 3: Type the mocks so we can call `.mockResolvedValue()` etc.
const mockDb = db as unknown as {
	item: {
		findMany: ReturnType<typeof vi.fn>;
		findFirst: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
	};
};

describe("itemService", () => {
	// Reset all mocks before each test so tests don't affect each other
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("list", () => {
		it("returns items for a user", async () => {
			const fakeItems = [{ id: "1", userId: "user-1", title: "Test Item", completed: false }];
			mockDb.item.findMany.mockResolvedValue(fakeItems);

			const result = await itemService.list("user-1");

			// Verify the service returns a successful result with the data
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(fakeItems);
			}

			// Verify Prisma was called with the right arguments
			expect(mockDb.item.findMany).toHaveBeenCalledWith({
				where: { userId: "user-1" },
				orderBy: { createdAt: "desc" },
			});
		});

		it("returns error on database failure", async () => {
			mockDb.item.findMany.mockRejectedValue(new Error("DB connection lost"));

			const result = await itemService.list("user-1");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("LIST_FAILED");
			}
		});
	});

	describe("create", () => {
		it("creates an item", async () => {
			const fakeItem = { id: "1", userId: "user-1", title: "New Item", completed: false };
			mockDb.item.create.mockResolvedValue(fakeItem);

			const result = await itemService.create("user-1", { title: "New Item" });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.title).toBe("New Item");
			}
		});
	});

	describe("delete", () => {
		it("returns NOT_FOUND when item does not exist", async () => {
			mockDb.item.findFirst.mockResolvedValue(null);

			const result = await itemService.delete("user-1", "nonexistent-id");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("NOT_FOUND");
			}
		});
	});
});
