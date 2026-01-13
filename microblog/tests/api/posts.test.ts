import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireUser: vi.fn().mockResolvedValue({ id: 1, username: "alice" }),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    post: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    like: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import { GET, POST } from "@/app/api/posts/route";

const postFindManyMock = prisma.post.findMany as any;
const postCreateMock = prisma.post.create as any;

beforeEach(() => {
  postFindManyMock.mockReset();
  postCreateMock.mockReset();
});

describe("posts API", () => {
  it("creates a new post with valid content", async () => {
    console.info("[posts.test] create post flow starting");

    postCreateMock.mockResolvedValueOnce({
      id: 1,
      content: "Hello world",
      authorId: 1,
      createdAt: new Date(),
    });

    const req = new Request("http://localhost/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Hello world" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    console.info("[posts.test] create post response", json);
    expect(json).toMatchObject({ content: "Hello world" });
  });

  it("returns 400 when post content is empty", async () => {
    const req = new Request("http://localhost/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "   " }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("fetches the feed for an authenticated user", async () => {
    console.info("[posts.test] feed fetch flow starting");

    postFindManyMock.mockResolvedValueOnce([
      {
        id: 1,
        content: "First",
        createdAt: new Date(),
        author: { id: 1, username: "alice", displayName: "Alice" },
        _count: { likes: 0, replies: 0 },
      },
    ]);

    const req = new Request("http://localhost/api/posts");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    console.info("[posts.test] feed fetch response", json);
    expect(Array.isArray(json.posts)).toBe(true);
  });
});
