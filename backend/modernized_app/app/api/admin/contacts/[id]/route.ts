import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
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
      return NextResponse.json({ message: "Invalid contact ID" }, { status: 400 });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 });
    }

    await Contact.findByIdAndDelete(id);

    return NextResponse.json({ message: "Message deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN DELETE CONTACT ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
