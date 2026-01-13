"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    async function handleLogout() {
        setSubmitting(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            setSubmitting(false);
            router.push("/");
            router.refresh();
        }
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={submitting}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:border-zinc-500 dark:border-zinc-700"
        >
            {submitting ? "Logging out..." : "Logout"}
        </button>
    );
}
