"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    username,
                    password,
                    displayName,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.error || "Registration failed");
            } else {
                router.push("/");
                router.refresh();
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mx-auto max-w-md space-y-4">
            <h1 className="text-xl font-semibold">Register</h1>
            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                <div className="space-y-1">
                    <label className="block text-xs font-medium">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800"
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-medium">
                        Username
                    </label>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800"
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-medium">
                        Display name (optional)
                    </label>
                    <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full rounded border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800"
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-medium">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800"
                    />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 w-full rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                >
                    {submitting ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
}
