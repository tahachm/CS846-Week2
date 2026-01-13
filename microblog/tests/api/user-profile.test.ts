import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    post: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import { GET } from "@/app/api/users/[username]/posts/route";

const userFindUniqueMock = prisma.user.findUnique as any;
const postFindManyMock = prisma.post.findMany as any;

beforeEach(() => {
  userFindUniqueMock.mockReset();
  postFindManyMock.mockReset();
});

describe("user profile posts API", () => {
  it("returns 400 when username is missing", async () => {
    console.info("[user-profile.test] missing username flow starting");

    const req = new Request("http://localhost/api/users//posts");
    // Simulate Next passing empty params
    const res = await GET(req, { params: { username: "" } as any });

    expect(res.status).toBe(400);
  });

  it("returns 404 when user does not exist", async () => {
    console.info("[user-profile.test] user not found flow starting");

    userFindUniqueMock.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/users/bob/posts");
    const res = await GET(req, { params: { username: "bob" } as any });

    expect(userFindUniqueMock).toHaveBeenCalledWith({ where: { username: "bob" } });
    expect(res.status).toBe(404);
  });

  it("returns user summary and their posts", async () => {
    console.info("[user-profile.test] happy-path profile + posts flow starting");

    userFindUniqueMock.mockResolvedValueOnce({
      id: 1,
      username: "alice",
      email: "alice@example.com",
      displayName: "Alice",
      bio: "Hello",
      createdAt: new Date(),
    });

    postFindManyMock.mockResolvedValueOnce([
      {
        id: 10,
        content: "First post",
        createdAt: new Date(),
        authorId: 1,
        _count: { likes: 2, replies: 1 },
      },
    ]);

    const req = new Request("http://localhost/api/users/alice/posts");
    const res = await GET(req, { params: { username: "alice" } as any });

    expect(userFindUniqueMock).toHaveBeenCalledWith({ where: { username: "alice" } });
    expect(postFindManyMock).toHaveBeenCalledWith({
      where: { authorId: 1 },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { likes: true, replies: true } } },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    console.info("[user-profile.test] happy-path response", json);

    expect(json.user).toMatchObject({
      id: 1,
      username: "alice",
      displayName: "Alice",
      bio: "Hello",
    });
    expect(Array.isArray(json.posts)).toBe(true);
    expect(json.posts[0]).toMatchObject({
      id: 10,
      content: "First post",
    });
  });
});
