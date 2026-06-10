import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
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
      return NextResponse.json({ message: "Invalid employee ID" }, { status: 400 });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    // Delete photo from Cloudinary if set
    // Legacy system uses base64, so no external deletion needed
    // if (employee.photo && employee.photo.startsWith("http")) { ... }

    await Employee.findByIdAndDelete(id);

    return NextResponse.json({ message: "Employee deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN DELETE EMPLOYEE ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}

export async function PUT(
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
      return NextResponse.json({ message: "Invalid employee ID" }, { status: 400 });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const name     = (formData.get("name") || "").toString().trim();
    const position = (formData.get("position") || "").toString().trim();
    const spec     = (formData.get("spec") || "").toString().trim();

    if (!name || !position) {
      return NextResponse.json({ message: "Name and position are required" }, { status: 400 });
    }

    const updateData: Record<string, any> = { name, position, spec };

    // Handle optional new photo upload
    const file = formData.get("photo") as File | null;
    if (file && file.name && file.size > 0) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["jpg", "jpeg", "png", "webp"].includes(ext)) {
        return NextResponse.json({ message: "Invalid file extension for photo" }, { status: 400 });
      }
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString("base64");
        const mimeType = file.type || "image/jpeg";
        updateData.photo = `data:${mimeType};base64,${base64Data}`;
      } catch (uploadError: any) {
        console.error("Base64 upload failure for team member edit:", uploadError);
        return NextResponse.json({ message: `Failed to process photo: ${uploadError.message || ""}` }, { status: 500 });
      }
    }

    const updated = await Employee.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN EDIT EMPLOYEE ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}

