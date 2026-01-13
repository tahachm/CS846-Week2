import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";
import UserProfilePage from "@/app/users/[username]/page";

// Mock auth and db so we don't hit real services
const mockFindUnique = vi.fn();
const mockPostFindMany = vi.fn();
const mockLikeFindMany = vi.fn();

vi.mock("@/lib/auth", () => ({
    getCurrentUser: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/db", () => ({
    prisma: {
        user: {
            findUnique: (...args: any[]) => mockFindUnique(...args),
        },
        post: {
            findMany: (...args: any[]) => mockPostFindMany(...args),
        },
        like: {
            findMany: (...args: any[]) => mockLikeFindMany(...args),
        },
    },
}));

describe("UserProfilePage params handling", () => {
    beforeEach(() => {
        mockFindUnique.mockReset();
        mockPostFindMany.mockReset();
        mockLikeFindMany.mockReset();
    });

    it("resolves params when they are a Promise and passes username to prisma", async () => {
        mockFindUnique.mockResolvedValue(null);

        const paramsPromise = Promise.resolve({ username: "alice" });

        let error: unknown;
        let element: ReactElement | null = null;

        try {
            // @ts-expect-error testing server component invocation
            element = await UserProfilePage({ params: paramsPromise });
        } catch (e) {
            error = e;
        }

        expect(error).toBeUndefined();
        expect(element).toBeTruthy();
        expect(mockFindUnique).toHaveBeenCalledTimes(1);
        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { username: "alice" },
        });
    });

    it("does not call prisma when username is missing", async () => {
        // If username is missing, our implementation should short-circuit
        // and render the "User not found" UI without touching prisma.

        let error: unknown;

        try {
            // @ts-expect-error testing server component invocation
            await UserProfilePage({ params: {} });
        } catch (e) {
            error = e;
        }

        expect(error).toBeUndefined();
        expect(mockFindUnique).not.toHaveBeenCalled();
    });
});
