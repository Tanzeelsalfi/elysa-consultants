import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface AdminUser {
  role: string;
  sub: string;
}

export async function verifyAdmin(request: NextRequest): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("admin_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) return null;

    const payload = jwt.verify(token, JWT_SECRET) as any;

    if (payload && payload.role === "admin") {
      return {
        role: payload.role,
        sub: payload.sub,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}
