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

        await prisma.like.upsert({
            where: {
                userId_postId: { userId: user.id, postId },
            },
            update: {},
            create: { userId: user.id, postId },
        });

        return NextResponse.json({ ok: true });
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

export async function DELETE(
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

        await prisma.like
            .delete({
                where: {
                    userId_postId: { userId: user.id, postId },
                },
            })
            .catch(() => {});

        return NextResponse.json({ ok: true });
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
