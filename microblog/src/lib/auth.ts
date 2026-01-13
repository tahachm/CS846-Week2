import { cookies } from "next/headers";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "session_id";

export async function registerUser(params: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
}) {
    const hashed = await bcrypt.hash(params.password, 10);
    const user = await prisma.user.create({
        data: {
            email: params.email,
            username: params.username,
            password: hashed,
            displayName: params.displayName,
        },
    });
    await createSession(user.id);
    return user;
}

export async function authenticateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    await createSession(user.id);
    return user;
}

async function createSession(userId: number) {
    const id = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
    await prisma.session.create({
        data: { id, userId, expiresAt },
    });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: expiresAt,
    });
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return null;
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
    });
    if (!session) return null;
    if (session.expiresAt < new Date()) {
        await prisma.session
            .delete({ where: { id: sessionId } })
            .catch(() => {});
        cookieStore.delete(SESSION_COOKIE);
        return null;
    }
    return session.user;
}

export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    return user;
}

export async function logout() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (sessionId) {
        await prisma.session
            .delete({ where: { id: sessionId } })
            .catch(() => {});
    }
    cookieStore.delete(SESSION_COOKIE);
}
