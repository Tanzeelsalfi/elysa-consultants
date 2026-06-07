import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("admin_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;

      if (payload.role !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json(
        {
          message: "Valid",
          role: "admin",
          username: payload.sub,
        },
        { status: 200 }
      );
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return NextResponse.json(
          { message: "Session expired. Please login again." },
          { status: 401 }
        );
      }
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
  } catch (error: any) {
    console.error("ADMIN VERIFY API ERROR:", error);
    return NextResponse.json(
      { 
        message: "Server Error", 
        error: error.message || error.toString(),
        stack: error.stack
      }, 
      { status: 500 }
    );
  }
}
