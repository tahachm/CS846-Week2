"use client";

import { useEffect, useState } from "react";

type Reply = {
    id: number;
    content: string;
    createdAt: string;
    author: {
        username: string;
        displayName: string | null;
    };
};

interface PostActionsProps {
    postId: number;
    initialLikeCount: number;
    initialReplyCount: number;
    initiallyLiked: boolean;
    authenticated: boolean;
}

export default function PostActions({
    postId,
    initialLikeCount,
    initialReplyCount,
    initiallyLiked,
    authenticated,
}: PostActionsProps) {
    const [liked, setLiked] = useState(initiallyLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [replyCount, setReplyCount] = useState(initialReplyCount);
    const [replies, setReplies] = useState<Reply[] | null>(null);
    const [showAllReplies, setShowAllReplies] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function ensureRepliesLoaded() {
        // If we already have at least as many replies loaded as the
        // counter says exist, skip refetching; otherwise get fresh data.
        if (replies && replies.length >= replyCount) return;
        setLoadingReplies(true);
        setError(null);
        try {
            const res = await fetch(`/api/posts/${postId}/replies`);
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to load replies");
            }
            const data = (await res.json()) as { replies: Reply[] };
            setReplies(data.replies);
        } catch (e: any) {
            setError(e.message || "Failed to load replies");
        } finally {
            setLoadingReplies(false);
        }
    }

    // Automatically load replies when there are any to show so that
    // up to 2 can be displayed by default under each post.
    useEffect(() => {
        if (replyCount > 0) {
            void ensureRepliesLoaded();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [replyCount, postId]);

    async function handleToggleLike() {
        if (!authenticated) {
            window.location.href = "/login";
            return;
        }
        setError(null);
        try {
            if (!liked) {
                const res = await fetch(`/api/posts/${postId}/likes`, {
                    method: "POST",
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || "Failed to like post");
                }
                setLiked(true);
                setLikeCount((c) => c + 1);
            } else {
                const res = await fetch(`/api/posts/${postId}/likes`, {
                    method: "DELETE",
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || "Failed to unlike post");
                }
                setLiked(false);
                setLikeCount((c) => Math.max(0, c - 1));
            }
        } catch (e: any) {
            setError(e.message || "Error updating like");
        }
    }

    async function handleReplySubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!authenticated) {
            window.location.href = "/login";
            return;
        }
        const text = replyText.trim();
        if (!text) return;
        if (text.length > 280) {
            setError("Reply exceeds 280 characters");
            return;
        }
        setSubmittingReply(true);
        setError(null);
        try {
            const res = await fetch(`/api/posts/${postId}/replies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to post reply");
            }
            const created = (await res.json()) as Reply;
            setReplyText("");
            setReplyCount((c) => c + 1);
            setReplies((current) =>
                current ? [...current, created] : [created]
            );
        } catch (e: any) {
            setError(e.message || "Failed to post reply");
        } finally {
            setSubmittingReply(false);
        }
    }

    return (
        <div className="mt-2 space-y-2 text-xs text-zinc-500">
            <div className="flex flex-wrap items-center gap-4">
                <button
                    type="button"
                    onClick={handleToggleLike}
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 transition-colors ${
                        liked
                            ? "border-blue-500 bg-blue-500/10 text-blue-600"
                            : "border-zinc-300 hover:border-zinc-500 dark:border-zinc-700"
                    }`}
                >
                    <span>{liked ? "Liked" : "Like"}</span>
                    <span className="text-[11px] text-zinc-500">
                        {likeCount}
                    </span>
                </button>
            </div>

            <form onSubmit={handleReplySubmit} className="space-y-1">
                <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    maxLength={280}
                    placeholder={
                        authenticated
                            ? "Write a reply (max 280 characters)"
                            : "Login to reply"
                    }
                    className="w-full resize-none rounded border border-zinc-200 bg-transparent p-2 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800"
                />
                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                        {replyText.length}/280
                    </span>
                    <button
                        type="submit"
                        disabled={submittingReply}
                        className="rounded bg-zinc-900 px-3 py-1 text-[11px] font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                    >
                        {submittingReply ? "Replying..." : "Reply"}
                    </button>
                </div>
            </form>

            {error && <p className="text-[11px] text-red-500">{error}</p>}

            {replyCount > 0 && (
                <div className="ml-4 space-y-2 border-l border-dashed border-zinc-200 pl-3 pt-2 text-xs dark:border-zinc-800">
                    {loadingReplies && (
                        <p className="text-[11px] text-zinc-500">
                            Loading replies...
                        </p>
                    )}
                    {replies && replies.length === 0 && !loadingReplies && (
                        <p className="text-[11px] text-zinc-500">
                            No replies yet.
                        </p>
                    )}
                    {replies && replies.length > 0 && (
                        <>
                            {(showAllReplies
                                ? replies
                                : replies.slice(0, 2)
                            ).map((reply) => (
                                <div key={reply.id} className="space-y-0.5">
                                    <p className="text-[11px] font-medium">
                                        {reply.author.displayName ||
                                            reply.author.username}
                                        <span className="ml-2 text-[10px] text-zinc-400">
                                            {new Date(
                                                reply.createdAt
                                            ).toLocaleString()}
                                        </span>
                                    </p>
                                    <p className="whitespace-pre-wrap text-[11px] leading-relaxed">
                                        {reply.content}
                                    </p>
                                </div>
                            ))}
                            {replies.length > 2 && !showAllReplies && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllReplies(true)}
                                    className="cursor-pointer text-[11px] font-medium text-blue-600 hover:underline"
                                >
                                    Show more replies ({replies.length - 2})
                                </button>
                            )}
                            {replies.length > 2 && showAllReplies && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllReplies(false)}
                                    className="cursor-pointer text-[11px] font-medium text-blue-600 hover:underline"
                                >
                                    Show fewer replies
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
