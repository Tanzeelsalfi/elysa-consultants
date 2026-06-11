import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function getAuthorizedUsers(): Record<string, string> {
  const raw = process.env.ADMIN_USERS || "admin:admin123";
  const users: Record<string, string> = {};

  raw.split(",").forEach((entry) => {
    const trimmed = entry.trim();
    if (trimmed.includes(":")) {
      const [username, password] = trimmed.split(":");
      if (username && password) {
        users[username.trim()] = password.trim();
      }
    }
  });

  return users;
}

function validateCredentials(username: string, password: string): boolean {
  const users = getAuthorizedUsers();
  return users[username] === password;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const username = (data.username || "").toString().trim();
    const password = (data.password || "").toString().trim();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { message: "Invalid credentials. Access denied." },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        role: "admin",
        sub: username,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        username,
        token,
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("ADMIN LOGIN API ERROR:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
