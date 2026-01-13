"use client";

import { useState } from "react";

export default function NewPostForm() {
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const text = content.trim();
        if (!text) return;
        if (text.length > 280) {
            setError("Post exceeds 280 characters");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "Failed to post");
            } else {
                setContent("");
                // simple refetch by reloading; could be optimized later
                window.location.reload();
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-2 rounded-md border border-zinc-200 bg-white p-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                maxLength={280}
                placeholder="What's happening?"
                className="w-full resize-none rounded border border-zinc-200 bg-transparent p-2 outline-none focus:border-zinc-400 dark:border-zinc-800"
            />
            <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{content.length}/280</span>
                    <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className="cursor-pointer rounded bg-zinc-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                    >
                    {submitting ? "Posting..." : "Post"}
                </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </form>
    );
}
