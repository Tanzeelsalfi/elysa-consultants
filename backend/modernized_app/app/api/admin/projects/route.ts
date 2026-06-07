import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { verifyAdmin } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return NextResponse.json(projects, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN GET PROJECTS ERROR:", error);
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

    // Parse formData
    const formData = await request.formData();
    const title = (formData.get("title") || "").toString().trim();
    const description = (formData.get("description") || "").toString().trim();
    const category = (formData.get("category") || "General").toString().trim();

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    const files = formData.getAll("images") as File[];
    const uploadedImages: string[] = [];

    for (const file of files) {
      if (file && file.name && file.size > 0) {
        // Validation
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!ext || !["jpg", "jpeg", "png", "webp"].includes(ext)) {
          return NextResponse.json(
            { message: `Invalid file extension for file ${file.name}` },
            { status: 400 }
          );
        }

        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const imageUrl = await uploadToCloudinary(buffer, "projects");
          uploadedImages.push(imageUrl);
        } catch (uploadError: any) {
          console.error("Cloudinary upload failure:", uploadError);
          return NextResponse.json(
            { message: `Failed to upload image: ${file.name}. ${uploadError.message || ""}` },
            { status: 500 }
          );
        }
      }
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { message: "At least one image is required" },
        { status: 400 }
      );
    }

    const project = new Project({
      title,
      description,
      category,
      images: uploadedImages,
    });

    await project.save();

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("ADMIN ADD PROJECT ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
