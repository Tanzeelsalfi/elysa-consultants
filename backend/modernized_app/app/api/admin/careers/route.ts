import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Career from "@/models/Career";
import { verifyAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const careers = await Career.find({}).sort({ createdAt: -1 });
    return NextResponse.json(careers, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN GET CAREERS ERROR:", error);
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
    const data = await request.json();

    const title = data.title?.trim();
    const description = data.description?.trim();
    const skillsRaw = data.skills;
    const location = data.location?.trim() || "Kashmir, India";
    const jobType = data.type?.trim().toLowerCase() || "full-time";

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    const skills = typeof skillsRaw === "string" 
      ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) 
      : (Array.isArray(skillsRaw) ? skillsRaw.map(s => String(s).trim()).filter(Boolean) : []);

    const careerDoc = new Career({
      title,
      description,
      skills,
      location,
      type: jobType,
    });
    await careerDoc.save();

    return NextResponse.json(careerDoc, { status: 201 });
  } catch (error: any) {
    console.error("ADMIN POST CAREER ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
