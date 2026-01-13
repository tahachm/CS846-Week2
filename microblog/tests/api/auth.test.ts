import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    session: {
      create: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  }),
}));

import { prisma } from "@/lib/db";
import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";

const userCreateMock = prisma.user.create as any;
const userFindUniqueMock = prisma.user.findUnique as any;

beforeEach(() => {
  userCreateMock.mockReset();
  userFindUniqueMock.mockReset();
});

describe("auth API", () => {
  it("registers a new user and returns safe fields", async () => {
    console.info("[auth.test] register flow starting");

    userCreateMock.mockResolvedValueOnce({
      id: 1,
      email: "alice@example.com",
      username: "alice",
      displayName: "Alice",
      createdAt: new Date(),
    });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "alice@example.com",
        username: "alice",
        displayName: "Alice",
        password: "password123",
      }),
    });

    const res = await registerPOST(req);

    // The register endpoint currently returns 200 on success.
    expect(res.status).toBe(200);
    const json = await res.json();
    console.info("[auth.test] register response", json);
    expect(json).toMatchObject({
      email: "alice@example.com",
      username: "alice",
      displayName: "Alice",
    });
    expect(json).not.toHaveProperty("password");
  });

  it("returns 401 for invalid login credentials", async () => {
    console.info("[auth.test] login invalid credentials flow starting");

    userFindUniqueMock.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "does-not-exist@example.com",
        password: "wrong",
      }),
    });

    const res = await loginPOST(req);
    expect(res.status).toBe(401);
  });
});
