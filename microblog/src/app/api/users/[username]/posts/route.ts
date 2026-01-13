import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: { username: string } };

export async function GET(_request: Request, { params }: Params) {
    const username = params.username;
    if (!username) {
        return NextResponse.json(
            { error: "Username is required" },
            { status: 400 }
        );
    }

    const user = await prisma.user.findUnique({
        where: { username },
    });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const posts = await prisma.post.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { likes: true, replies: true } },
        },
    });

    return NextResponse.json({
        user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            createdAt: user.createdAt,
        },
        posts,
    });
}
