import { NextResponse } from "next/server";

import { existingUsers } from "@/lib/mock-db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, email } = body;

        // Check if username already exists
        if (existingUsers.some(u => u.username.toLowerCase() === username?.toLowerCase())) {
            return NextResponse.json(
                { message: "Username already exists" },
                { status: 400 }
            );
        }

        // Check if email already exists
        if (existingUsers.some(u => u.email.toLowerCase() === email?.toLowerCase())) {
            return NextResponse.json(
                { message: "Email id already registered" },
                { status: 400 }
            );
        }

        // Simple mock logic: accept any valid-looking data
        console.log("Mock Registration Success:", body);

        return NextResponse.json(
            {
                message: "Account created successfully!",
                user: { id: Date.now(), fullName: body.fullName, email: body.email }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Registration failed: Invalid data" },
            { status: 400 }
        );
    }
}
