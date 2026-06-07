import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" }, { status: 200 });

  const cookieStore = await cookies();
  cookieStore.delete("admin_token");

  return response;
}
