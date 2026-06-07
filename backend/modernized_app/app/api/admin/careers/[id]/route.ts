import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Career from "@/models/Career";
import { verifyAdmin } from "@/lib/auth";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid career ID" }, { status: 400 });
    }

    const career = await Career.findById(id);
    if (!career) {
      return NextResponse.json({ message: "Career not found" }, { status: 404 });
    }

    await Career.findByIdAndDelete(id);

    return NextResponse.json({ message: "Career deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN DELETE CAREER ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
