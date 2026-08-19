import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Simple mock logic
        console.log("Mock Login:", body);

        if (body.email === "admin@example.com" && body.password === "Password123!") {
            return NextResponse.json({
                message: "Login successful",
                token: "mock-jwt-token",
                user: { id: 1, fullName: "Admin User", email: body.email }
            });
        }

        // Default success for demo purposes, or return error if specific test needed
        return NextResponse.json({
            message: "Login successful",
            token: "mock-jwt-token",
            user: { id: Date.now(), fullName: "Demo User", email: body.email }
        });
    } catch {
        return NextResponse.json(
            { message: "Login failed" },
            { status: 400 }
        );
    }
}
