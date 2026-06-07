import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";
import nodemailer from "nodemailer";

async function sendLeadEmail(name: string, phone: string, project: string) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn("EMAIL_USER or EMAIL_PASS environment variables are not set. Skipping email.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 5000,
  });

  const subject = "New Website Lead";
  const htmlBody = `
    <h2>New Client Inquiry</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Project:</strong> ${project}</p>
  `;

  try {
    await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      subject: subject,
      html: htmlBody,
    });
    console.log("Lead notification email sent successfully!");
  } catch (error) {
    console.error("Nodemailer SMTP Error (Lead Notification Failed):", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const { name, phone, project } = data;

    if (!name || !phone || !project) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const feedbackDoc = new Feedback({
      name,
      phone,
      project,
    });
    await feedbackDoc.save();

    await sendLeadEmail(name, phone, project);

    return NextResponse.json({ message: "Lead Submitted Successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("FEEDBACK API ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
