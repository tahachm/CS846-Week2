import { describe, it, expect, vi, beforeEach } from "vitest";

const requireUserMock = vi.fn().mockResolvedValue({ id: 1 });

vi.mock("@/lib/auth", () => ({
    requireUser: () => requireUserMock(),
}));

vi.mock("@/lib/db", () => ({
    prisma: {
        like: {
            upsert: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/db";
import { POST, DELETE } from "@/app/api/posts/[id]/likes/route";

const upsertMock = prisma.like.upsert as any;
const deleteMock = prisma.like.delete as any;

beforeEach(() => {
    upsertMock.mockReset();
    deleteMock.mockReset();
});

describe("likes API", () => {
    it("parses post id from URL for POST when params.id is missing", async () => {
        console.info("[likes.test] POST like flow starting");
        upsertMock.mockResolvedValueOnce({});

        const req = new Request("http://localhost/api/posts/42/likes", {
            method: "POST",
        });

        const res = await POST(req, { params: {} });

        expect(res.status).toBe(200);
        expect(upsertMock).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId_postId: { userId: 1, postId: 42 } },
            })
        );
    });

    it("parses post id from URL for DELETE when params.id is missing", async () => {
        console.info("[likes.test] DELETE unlike flow starting");
        deleteMock.mockResolvedValueOnce({});

        const req = new Request("http://localhost/api/posts/7/likes", {
            method: "DELETE",
        });

        const res = await DELETE(req, { params: {} });

        expect(res.status).toBe(200);
        expect(deleteMock).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId_postId: { userId: 1, postId: 7 } },
            })
        );
    });

    it("returns 400 when post id cannot be determined", async () => {
        console.info("[likes.test] invalid id flow starting");
        const req = new Request("http://localhost/api/posts/abc/likes", {
            method: "POST",
        });

        const res = await POST(req, { params: {} });

        expect(res.status).toBe(400);
    });
});
