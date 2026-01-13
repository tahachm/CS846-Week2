import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import PostActions from "@/components/post-actions";

type RouteParams = { username: string } | Promise<{ username: string }>;
type PageProps = { params: RouteParams };

export default async function UserProfilePage({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params as any);
    const username = resolvedParams?.username as string | undefined;

    if (!username) {
        return (
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">User not found</h1>
                <Link
                    href="/"
                    className="text-sm text-blue-600 hover:underline"
                >
                    Back to feed
                </Link>
            </div>
        );
    }

    const profileUser = await prisma.user.findUnique({ where: { username } });
    if (!profileUser) {
        return (
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">User not found</h1>
                <Link
                    href="/"
                    className="text-sm text-blue-600 hover:underline"
                >
                    Back to feed
                </Link>
            </div>
        );
    }

    const viewer = await getCurrentUser();

    const posts = await prisma.post.findMany({
        where: { authorId: profileUser.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { likes: true, replies: true } },
        },
    });

    let likedPostIds = new Set<number>();
    if (viewer && posts.length > 0) {
        const likes = await prisma.like.findMany({
            where: {
                userId: viewer.id,
                postId: { in: posts.map((p) => p.id) },
            },
            select: { postId: true },
        });
        likedPostIds = new Set(likes.map((l) => l.postId));
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    {profileUser.displayName ?? profileUser.username}
                </h1>
                <p className="text-sm text-zinc-500">@{profileUser.username}</p>
                {profileUser.bio && (
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                        {profileUser.bio}
                    </p>
                )}
                <p className="mt-1 text-xs text-zinc-500">
                    Joined {profileUser.createdAt.toLocaleDateString()}
                </p>
            </div>

            <div>
                <h2 className="mb-3 text-lg font-semibold">Posts</h2>
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {posts.map((post) => (
                        <li key={post.id} className="py-3">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                {post.content}
                            </p>
                            <PostActions
                                postId={post.id}
                                initialLikeCount={post._count.likes}
                                initialReplyCount={post._count.replies}
                                initiallyLiked={likedPostIds.has(post.id)}
                                authenticated={!!viewer}
                            />
                        </li>
                    ))}
                    {posts.length === 0 && (
                        <li className="py-8 text-center text-sm text-zinc-500">
                            No posts yet.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
