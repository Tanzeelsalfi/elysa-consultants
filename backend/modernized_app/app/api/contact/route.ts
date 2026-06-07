import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import nodemailer from "nodemailer";

function sanitize(text: string, maxLen: number = 500): string {
  if (!text) return "";
  return text.toString().trim().replace(/[<>"'`;]/g, "").substring(0, maxLen);
}

function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

async function sendContactEmail(visitorName: string, visitorEmail: string, message: string) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn("EMAIL_USER or EMAIL_PASS environment variables are not set. Skipping email.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports (like 587)
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 5000,
  });

  const subject = `New Contact Message from ${visitorName}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
      <h2 style="color: #1a1a2e; border-bottom: 2px solid #c9a84c; padding-bottom: 8px;">
        New Contact Message — Elysa Consultants
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555; width: 130px;">Name:</td>
          <td style="padding: 10px; color: #222;">${visitorName}</td>
        </tr>
        <tr style="background: #f0f0f0;">
          <td style="padding: 10px; font-weight: bold; color: #555;">Email:</td>
          <td style="padding: 10px; color: #222;">
            <a href="mailto:${visitorEmail}" style="color: #c9a84c;">${visitorEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555;">Message:</td>
          <td style="padding: 10px; color: #222;">${message}</td>
        </tr>
      </table>
      <p style="color: #888; font-size: 13px; margin-top: 24px;">
        Reply directly to this email to respond to ${visitorName} at ${visitorEmail}.
      </p>
      <p style="color: #888; font-size: 12px;">
        Sent via Elysa Consultants website contact form.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: emailUser,
      to: emailUser, // Send TO admin inbox
      replyTo: visitorEmail, // So admin can reply directly to visitor
      subject: subject,
      html: htmlBody,
    });
    console.log(`Contact email sent from ${visitorEmail}`);
  } catch (error) {
    console.error("Nodemailer SMTP Error (Email Notification Failed):", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const name = sanitize(data.name || "", 100);
    const email = sanitize(data.email || "", 200);
    const phone = sanitize(data.phone || "", 20);
    const message = sanitize(data.message || "", 2000);

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { message: "Message is too short (minimum 10 characters)." },
        { status: 400 }
      );
    }

    // Save to database
    const contactDoc = new Contact({
      name,
      email,
      phone,
      message,
    });
    await contactDoc.save();

    // Send email to admin. In serverless, we must await to ensure execution before container freezes.
    await sendContactEmail(name, email, message);

    return NextResponse.json(
      { message: "Your message has been sent successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("CONTACT API ERROR:", error);
    return NextResponse.json(
      { 
        message: "Failed to send message. Please try again.", 
        error: error.message || error.toString(),
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
