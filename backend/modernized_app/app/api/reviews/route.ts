import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import nodemailer from "nodemailer";

function sanitize(text: string, maxLen: number = 1000): string {
  if (!text) return "";
  return text.toString().trim().replace(/[<>"'`;]/g, "").substring(0, maxLen);
}

async function sendReviewEmail(name: string, rating: number, comment: string) {
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

  const starStr = "★".repeat(rating) + "☆".repeat(5 - rating);
  const subject = `New Website Review (${rating}/5 Stars) from ${name}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
      <h2 style="color: #1a1a2e; border-bottom: 2px solid #c9a84c; padding-bottom: 8px; margin-top: 0;">
        New Client Review Submitted
      </h2>
      <p style="font-size: 15px; color: #333;">
        A visitor has posted feedback/review on the website:
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555; width: 140px; border-bottom: 1px solid #eee;">Reviewer:</td>
          <td style="padding: 10px; color: #222; border-bottom: 1px solid #eee;">${name}</td>
        </tr>
        <tr style="background: #fdfdfd;">
          <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Rating:</td>
          <td style="padding: 10px; color: #f39c12; font-size: 18px; font-weight: bold; border-bottom: 1px solid #eee;">
            ${starStr} (${rating}/5 Stars)
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555; vertical-align: top; padding-top: 10px;">Comment:</td>
          <td style="padding: 10px; color: #222; font-style: italic; line-height: 1.6;">"${comment}"</td>
        </tr>
      </table>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">
        Sent via Elysa Consultants website Reviews form.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      subject: subject,
      html: htmlBody,
    });
    console.log(`Review email sent successfully from ${name}`);
  } catch (error) {
    console.error("Nodemailer SMTP Error (Review Email Notification Failed):", error);
  }
}

export async function GET() {
  try {
    await dbConnect();
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error: any) {
    console.error("GET REVIEWS ERROR:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const name = sanitize(data.name || "", 100);
    const comment = sanitize(data.comment || "", 1000);
    const rating = parseInt(data.rating, 10);

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be a valid integer between 1 and 5." },
        { status: 400 }
      );
    }

    if (!name || !comment) {
      return NextResponse.json(
        { message: "Name, rating, and review comment are required." },
        { status: 400 }
      );
    }

    const reviewDoc = new Review({
      name,
      rating,
      comment,
    });
    await reviewDoc.save();

    await sendReviewEmail(name, rating, comment);

    return NextResponse.json(
      { message: "Review submitted successfully! Thank you for your feedback." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST REVIEW ERROR:", error);
    return NextResponse.json(
      { message: "Failed to submit review. Please try again." },
      { status: 500 }
    );
  }
}
