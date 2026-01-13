import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";

export async function POST(request: Request) {
    const body = await request.json();
    const { email, password } = body ?? {};
    if (!email || !password) {
        return NextResponse.json(
            { error: "Missing email or password" },
            { status: 400 }
        );
    }
    const user = await authenticateUser(
        String(email).toLowerCase(),
        String(password)
    );
    if (!user) {
        return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
        );
    }
    return NextResponse.json({
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
    });
}
