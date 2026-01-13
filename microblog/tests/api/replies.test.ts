import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
    requireUser: vi.fn().mockResolvedValue({ id: 1 }),
}));

vi.mock("@/lib/db", () => ({
    prisma: {
        reply: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/db";
import { GET, POST } from "@/app/api/posts/[id]/replies/route";

const findManyMock = prisma.reply.findMany as any;
const createMock = prisma.reply.create as any;

beforeEach(() => {
    findManyMock.mockReset();
    createMock.mockReset();
});

describe("replies API", () => {
    it("parses post id from URL when params.id is missing", async () => {
        console.info("[replies.test] GET list flow starting");
        findManyMock.mockResolvedValueOnce([]);

        const req = new Request("http://localhost/api/posts/123/replies");
        const res = await GET(req, { params: {} });

        expect(res.status).toBe(200);
        expect(findManyMock).toHaveBeenCalledWith(
            expect.objectContaining({ where: { postId: 123 } })
        );
    });

    it("returns 400 when post id cannot be determined", async () => {
        console.info("[replies.test] invalid id flow starting");
        const req = new Request("http://localhost/api/posts/abc/replies");
        const res = await GET(req, { params: {} });

        expect(res.status).toBe(400);
    });

    it("creates reply including author relation and returns JSON", async () => {
        console.info("[replies.test] POST create flow starting");
        createMock.mockResolvedValueOnce({
            id: 1,
            content: "hello",
            createdAt: new Date().toISOString(),
            author: { id: 1, username: "alice", displayName: "Alice" },
            postId: 123,
            authorId: 1,
        });

        const req = new Request("http://localhost/api/posts/123/replies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: "hello" }),
        });

        const res = await POST(req, { params: {} });

        expect(createMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    content: "hello",
                    authorId: 1,
                    postId: 123,
                }),
                include: {
                    author: {
                        select: { id: true, username: true, displayName: true },
                    },
                },
            })
        );

        expect(res.status).toBe(201);
        const json = await res.json();
        console.info("[replies.test] POST create response", json);
        expect(json).toMatchObject({ content: "hello" });
        expect(json.author).toBeDefined();
    });
});
