import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

type RouteParams = { id?: string };

function getPostIdFromRequest(
    request: Request,
    params: RouteParams | null
): number | null {
    const rawFromParams = params?.id;
    let raw = rawFromParams;

    if (!raw) {
        try {
            const url = new URL(request.url);
            const segments = url.pathname.split("/");
            const postsIndex = segments.indexOf("posts");
            if (postsIndex !== -1 && segments.length > postsIndex + 1) {
                raw = segments[postsIndex + 1];
            }
        } catch {
            // Ignore URL parsing errors and fall through to NaN check below
        }
    }

    const postId = Number(raw);
    if (!Number.isFinite(postId)) return null;
    return postId;
}

async function resolveParams(
    params: RouteParams | Promise<RouteParams>
): Promise<RouteParams> {
    if (typeof (params as any)?.then === "function") {
        return await (params as Promise<RouteParams>);
    }
    return params as RouteParams;
}

export async function GET(
    request: Request,
    context: { params: RouteParams | Promise<RouteParams> }
) {
    const params = await resolveParams(context.params);
    const postId = getPostIdFromRequest(request, params);
    if (postId === null) {
        return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const replies = await prisma.reply.findMany({
        where: { postId },
        orderBy: { createdAt: "asc" },
        include: {
            author: { select: { id: true, username: true, displayName: true } },
        },
    });
    return NextResponse.json({ replies });
}

export async function POST(
    request: Request,
    context: { params: RouteParams | Promise<RouteParams> }
) {
    try {
        const user = await requireUser();
        const params = await resolveParams(context.params);
        const postId = getPostIdFromRequest(request, params);
        if (postId === null) {
            return NextResponse.json(
                { error: "Invalid post id" },
                { status: 400 }
            );
        }

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
                { error: "Reply exceeds 280 characters" },
                { status: 400 }
            );
        }

        // One-level replies only: always attach directly to the parent post
        // Include author so the client has a consistent shape with the GET handler
        const reply = await prisma.reply.create({
            data: {
                content: text,
                authorId: user.id,
                postId,
            },
            include: {
                author: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });

        return NextResponse.json(reply, { status: 201 });
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
