import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Microblog",
    description: "Simple microblogging app",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getCurrentUser();
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <div className="min-h-screen bg-background text-foreground">
                    <header className="border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
                        <div className="mx-auto flex max-w-3xl items-center justify-between">
                            <a href="/" className="text-lg font-semibold">
                                Microblog
                            </a>
                            <nav className="flex items-center gap-3 text-sm">
                                {user ? (
                                    <>
                                        <span className="text-xs text-zinc-500">
                                            Signed in as{" "}
                                            <strong>{user.username}</strong>
                                        </span>
                                        <LogoutButton />
                                    </>
                                ) : (
                                    <>
                                        <a
                                            href="/login"
                                            className="hover:underline"
                                        >
                                            Login
                                        </a>
                                        <a
                                            href="/register"
                                            className="hover:underline"
                                        >
                                            Register
                                        </a>
                                    </>
                                )}
                            </nav>
                        </div>
                    </header>
                    <main className="mx-auto max-w-3xl px-4 py-6">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
