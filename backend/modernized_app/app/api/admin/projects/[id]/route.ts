import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { verifyAdmin } from "@/lib/auth";
import mongoose from "mongoose";

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
      return NextResponse.json({ message: "Invalid project ID" }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const title = (formData.get("title") || "").toString().trim();
    const description = (formData.get("description") || "").toString().trim();
    const category = (formData.get("category") || "").toString().trim();

    // Parse keep_images
    const keepImagesRaw = formData.get("keep_images");
    let keepImages: string[] = [];

    if (keepImagesRaw) {
      try {
        keepImages = JSON.parse(keepImagesRaw.toString());
      } catch {
        keepImages = keepImagesRaw
          .toString()
          .split(",")
          .map((x) => x.trim())
          .filter((x) => x);
      }
    }

    const existingImages = project.images || [];
    
    // Purge images that were deleted by admin from Cloudinary
    // Legacy system uses base64, so no external deletion needed
    // const removedImages = existingImages.filter((img) => !keepImages.includes(img));
    // for (const imgUrl of removedImages) { ... }

    const updatedImages = [...keepImages];

    // Handle new image uploads
    const files = formData.getAll("images") as File[];
    for (const file of files) {
      if (file && file.name && file.size > 0) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext && ["jpg", "jpeg", "png", "webp"].includes(ext)) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Data = buffer.toString("base64");
            const mimeType = file.type || "image/jpeg";
            const imageUrl = `data:${mimeType};base64,${base64Data}`;
            updatedImages.push(imageUrl);
          } catch (uploadErr) {
            console.error("Base64 upload failure inside PUT:", uploadErr);
          }
        }
      }
    }

    if (updatedImages.length === 0) {
      return NextResponse.json(
        { message: "At least one image is required" },
        { status: 400 }
      );
    }

    // Update document
    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    project.images = updatedImages;

    await project.save();

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN UPDATE PROJECT ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}

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
      return NextResponse.json({ message: "Invalid project ID" }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // Delete all associated images from Cloudinary to prevent orphaned files
    // Legacy system uses base64, so no external deletion needed
    // const images = project.images || [];
    // for (const imgUrl of images) { ... }

    await Project.findByIdAndDelete(id);

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN DELETE PROJECT ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
