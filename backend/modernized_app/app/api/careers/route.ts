import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Career from "@/models/Career";

export async function GET() {
  try {
    await dbConnect();
    const careers = await Career.find({}).sort({ createdAt: -1 });
    return NextResponse.json(careers, { status: 200 });
  } catch (error: any) {
    console.error("GET CAREERS ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
