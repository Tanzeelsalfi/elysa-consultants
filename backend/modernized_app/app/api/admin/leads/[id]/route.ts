import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";
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
      return NextResponse.json({ message: "Invalid lead ID" }, { status: 400 });
    }

    const lead = await Feedback.findById(id);
    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    await Feedback.findByIdAndDelete(id);

    return NextResponse.json({ message: "Lead deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN DELETE LEAD ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
