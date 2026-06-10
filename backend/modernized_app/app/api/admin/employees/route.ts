import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";
import { verifyAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const employees = await Employee.find({});
    return NextResponse.json(employees, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN GET EMPLOYEES ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const formData = await request.formData();
    const name = (formData.get("name") || "").toString().trim();
    const position = (formData.get("position") || "").toString().trim();
    const spec = (formData.get("spec") || "").toString().trim();

    if (!name || !position) {
      return NextResponse.json(
        { message: "Name and position are required" },
        { status: 400 }
      );
    }

    // Photo file upload
    let photoUrl = "";
    const file = formData.get("photo") as File | null;
    if (file && file.name && file.size > 0) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["jpg", "jpeg", "png", "webp"].includes(ext)) {
        return NextResponse.json(
          { message: "Invalid file extension for team member photo" },
          { status: 400 }
        );
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString("base64");
        const mimeType = file.type || "image/jpeg";
        photoUrl = `data:${mimeType};base64,${base64Data}`;
      } catch (uploadError: any) {
        console.error("Base64 upload failure for team member:", uploadError);
        return NextResponse.json(
          { message: `Failed to process photo: ${uploadError.message || ""}` },
          { status: 500 }
        );
      }
    }

    const employee = new Employee({
      name,
      position,
      spec,
      photo: photoUrl,
    });

    await employee.save();

    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    console.error("ADMIN ADD EMPLOYEE ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
