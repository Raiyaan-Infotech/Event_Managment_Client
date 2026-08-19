import { NextResponse } from "next/server";
import { existingUsers } from "@/lib/mock-db";

export async function POST(request: Request) {
    try {
        const { field, value } = await request.json();

        if (field === "username") {
            const exists = existingUsers.some(u => u.username.toLowerCase() === value.toLowerCase());
            return NextResponse.json({ exists, message: exists ? "Username already exists" : "" });
        }

        if (field === "email") {
            const exists = existingUsers.some(u => u.email.toLowerCase() === value.toLowerCase());
            return NextResponse.json({ exists, message: exists ? "Email id already registered" : "" });
        }

        return NextResponse.json({ exists: false });
    } catch (error) {
        return NextResponse.json({ exists: false, error: "Validation failed" }, { status: 500 });
    }
}
