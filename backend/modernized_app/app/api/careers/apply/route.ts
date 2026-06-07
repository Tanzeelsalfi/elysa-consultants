import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Career from "@/models/Career";
import Application from "@/models/Application";
import nodemailer from "nodemailer";

function sanitize(text: string, maxLen: number = 500): string {
  if (!text) return "";
  return text.toString().trim().replace(/[<>"'`;]/g, "").substring(0, maxLen);
}

function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

async function sendApplicationEmail(
  candidateName: string,
  candidateEmail: string,
  candidatePhone: string,
  resumeLink: string,
  coverLetter: string,
  jobTitle: string
) {
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

  const subject = `New Job Application for ${jobTitle} from ${candidateName}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
      <h2 style="color: #1a1a2e; border-bottom: 2px solid #c9a84c; padding-bottom: 8px; margin-top: 0;">
        New Job Application — Elysa Consultants
      </h2>
      <p style="font-size: 15px; color: #333;">
        You have received a new job application for the position: <strong>${jobTitle}</strong>
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555; width: 150px; border-bottom: 1px solid #eee;">Position:</td>
          <td style="padding: 10px; color: #222; font-weight: bold; border-bottom: 1px solid #eee;">${jobTitle}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Candidate Name:</td>
          <td style="padding: 10px; color: #222; border-bottom: 1px solid #eee;">${candidateName}</td>
        </tr>
        <tr style="background: #fdfdfd;">
          <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Email:</td>
          <td style="padding: 10px; color: #222; border-bottom: 1px solid #eee;">
            <a href="mailto:${candidateEmail}" style="color: #c9a84c;">${candidateEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Phone Number:</td>
          <td style="padding: 10px; color: #222; border-bottom: 1px solid #eee;">
            <a href="tel:${candidatePhone}" style="color: #c9a84c;">${candidatePhone}</a>
          </td>
        </tr>
        <tr style="background: #fdfdfd;">
          <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Resume / Link:</td>
          <td style="padding: 10px; color: #222; border-bottom: 1px solid #eee;">
            ${resumeLink ? `<a href="${resumeLink}" target="_blank" style="color: #c9a84c; text-decoration: underline;">${resumeLink}</a>` : "Not Provided"}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555; vertical-align: top; padding-top: 10px;">Cover Letter:</td>
          <td style="padding: 10px; color: #222; white-space: pre-wrap; line-height: 1.6;">${coverLetter || "None"}</td>
        </tr>
      </table>
      <p style="color: #888; font-size: 13px; margin-top: 24px;">
        Reply directly to this email to contact the candidate.
      </p>
      <p style="color: #888; font-size: 12px;">
        Sent via Elysa Consultants website Careers portal.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      replyTo: candidateEmail,
      subject: subject,
      html: htmlBody,
    });
    console.log(`Careers application email sent successfully from ${candidateName}`);
  } catch (error) {
    console.error("Nodemailer SMTP Error (Careers Application Email Notification Failed):", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const name = sanitize(data.name || "", 100);
    const email = sanitize(data.email || "", 200);
    const phone = sanitize(data.phone || "", 20);
    const resume = sanitize(data.resume || "", 500);
    const message = sanitize(data.message || "", 2000);
    const jobId = data.jobId || "";
    let jobTitle = sanitize(data.jobTitle || "", 200);

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { message: "Name, email, and phone number are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Try to resolve jobTitle if jobId is given
    if (jobId) {
      try {
        const job = await Career.findById(jobId);
        if (job) {
          jobTitle = job.title;
        }
      } catch (err) {
        // ID might be non-objectId format, safe fallback
      }
    }

    if (!jobTitle) {
      jobTitle = "General Application";
    }

    const applicationDoc = new Application({
      name,
      email,
      phone,
      resume,
      message,
      jobId,
      jobTitle,
    });
    await applicationDoc.save();

    await sendApplicationEmail(name, email, phone, resume, message, jobTitle);

    return NextResponse.json(
      { message: "Your application has been submitted successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("APPLY CAREER ERROR:", error);
    return NextResponse.json(
      { message: "Failed to submit application. Please try again." },
      { status: 500 }
    );
  }
}
