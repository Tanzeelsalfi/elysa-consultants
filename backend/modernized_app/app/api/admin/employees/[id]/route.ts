import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import { verifyAdmin } from "@/lib/auth";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
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
    if (employee.photo) {
      await deleteFromCloudinary(employee.photo);
    }

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
        // Remove old photo first
        if (employee.photo) {
          await deleteFromCloudinary(employee.photo);
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        updateData.photo = await uploadToCloudinary(buffer, "team");
      } catch (uploadError: any) {
        console.error("Cloudinary upload failure for team member edit:", uploadError);
        return NextResponse.json({ message: `Failed to upload photo: ${uploadError.message || ""}` }, { status: 500 });
      }
    }

    const updated = await Employee.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN EDIT EMPLOYEE ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}

