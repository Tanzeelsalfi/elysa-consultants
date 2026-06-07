import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Employee from "@/models/Employee";

export async function GET() {
  try {
    await dbConnect();
    const employees = await Employee.find({});
    return NextResponse.json(employees, { status: 200 });
  } catch (error: any) {
    console.error("GET EMPLOYEES ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
