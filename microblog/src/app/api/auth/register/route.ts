import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, username, password, displayName } = body ?? {};
        if (!email || !username || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }
        if (password.length < 5) {
            return NextResponse.json(
                { error: "Password must be at least 5 characters" },
                { status: 400 }
            );
        }
        const user = await registerUser({
            email: String(email).toLowerCase(),
            username: String(username),
            password: String(password),
            displayName: displayName ? String(displayName) : undefined,
        });
        return NextResponse.json({
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
        });
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Email or username already in use" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
