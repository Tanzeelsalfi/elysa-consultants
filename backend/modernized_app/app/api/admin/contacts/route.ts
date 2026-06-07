import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import { verifyAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    return NextResponse.json(contacts, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN GET CONTACTS ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
