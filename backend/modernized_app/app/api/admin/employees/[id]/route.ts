import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import { verifyAdmin } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
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
