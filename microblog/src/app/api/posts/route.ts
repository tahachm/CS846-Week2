import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
    try {
        await requireUser();
    } catch (error: any) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");

    const posts = await prisma.post.findMany({
        take: PAGE_SIZE + 1,
        orderBy: { createdAt: "desc" },
        cursor: cursor ? { id: Number(cursor) } : undefined,
        skip: cursor ? 1 : 0,
        include: {
            author: {
                select: { id: true, username: true, displayName: true },
            },
            _count: {
                select: { likes: true, replies: true },
            },
        },
    });

    let nextCursor: number | null = null;
    if (posts.length > PAGE_SIZE) {
        const next = posts.pop();
        nextCursor = next!.id;
    }

    return NextResponse.json({ posts, nextCursor });
}

export async function POST(request: Request) {
    try {
        const user = await requireUser();
        const body = await request.json();
        const { content } = body ?? {};
        const text = String(content ?? "").trim();
        if (!text) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }
        if (text.length > 280) {
            return NextResponse.json(
                { error: "Post exceeds 280 characters" },
                { status: 400 }
            );
        }

        const post = await prisma.post.create({
            data: {
                content: text,
                authorId: user.id,
            },
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error: any) {
        if (error.message === "Unauthorized") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
