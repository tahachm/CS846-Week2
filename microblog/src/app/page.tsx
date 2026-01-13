import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import NewPostForm from "./new-post-form";
import PostActions from "@/components/post-actions";
import { redirect } from "next/navigation";

export default async function Home() {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }

    const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
            author: { select: { id: true, username: true, displayName: true } },
            _count: { select: { likes: true, replies: true } },
        },
    });

    let likedPostIds = new Set<number>();
    if (user && posts.length > 0) {
        const likes = await prisma.like.findMany({
            where: { userId: user.id, postId: { in: posts.map((p) => p.id) } },
            select: { postId: true },
        });
        likedPostIds = new Set(likes.map((l) => l.postId));
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Global Feed</h1>
                <span className="text-sm text-zinc-500">
                    Signed in as <strong>{user.username}</strong>
                </span>
            </div>

            <NewPostForm />

            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {posts.map((post) => (
                    <li key={post.id} className="py-4">
                        <div className="mb-1 text-sm text-zinc-500">
                            <Link
                                href={`/users/${post.author.username}`}
                                className="font-medium hover:underline"
                            >
                                {post.author.displayName ??
                                    post.author.username}
                            </Link>
                            <span className="ml-2 text-xs text-zinc-400">
                                {post.createdAt.toLocaleString()}
                            </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {post.content}
                        </p>
                        <PostActions
                            postId={post.id}
                            initialLikeCount={post._count.likes}
                            initialReplyCount={post._count.replies}
                            initiallyLiked={likedPostIds.has(post.id)}
                            authenticated={!!user}
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
    );
}
