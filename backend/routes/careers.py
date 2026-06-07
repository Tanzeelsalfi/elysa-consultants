import datetime
import re
from flask import Blueprint, jsonify, request
from bson import ObjectId
from config.db import get_db
from utils.mail import send_email_async

careers_bp = Blueprint("careers", __name__)


def serialize(doc):
    if not doc:
        return doc
    doc["_id"] = str(doc["_id"])
    for k, v in doc.items():
        if isinstance(v, datetime.datetime):
            doc[k] = v.isoformat()
    return doc


def sanitize(text, max_len=500):
    """Strip dangerous characters and limit length."""
    if not text:
        return ""
    text = str(text).strip()
    text = re.sub(r"[<>\"'`;]", "", text)
    return text[:max_len]


def is_valid_email(email):
    pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


@careers_bp.route("", methods=["GET"])
@careers_bp.route("/", methods=["GET"])
def get_careers():
    try:
        db = get_db()
        jobs = [serialize(doc) for doc in db.careers.find().sort("createdAt", -1)]
        return jsonify(jobs), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@careers_bp.route("/apply", methods=["POST"])
@careers_bp.route("/apply/", methods=["POST"])
def apply_career():
    try:
        data = request.get_json() or {}

        name = sanitize(data.get("name", ""), 100)
        email = sanitize(data.get("email", ""), 200)
        phone = sanitize(data.get("phone", ""), 20)
        resume = sanitize(data.get("resume", ""), 500)
        message = sanitize(data.get("message", ""), 2000)
        job_id = data.get("jobId", "")
        job_title = sanitize(data.get("jobTitle", ""), 200)

        # Validation
        if not name or not email or not phone:
            return jsonify({"message": "Name, email, and phone number are required."}), 400

        if not is_valid_email(email):
            return jsonify({"message": "Please enter a valid email address."}), 400

        db = get_db()

        # If jobId is provided, try to find the actual job and use its title
        if job_id:
            try:
                job = db.careers.find_one({"_id": ObjectId(job_id)})
                if job:
                    job_title = job.get("title", job_title)
            except Exception:
                pass

        if not job_title:
            job_title = "General Application"

        # Save to database
        application_doc = {
            "name": name,
            "email": email,
            "phone": phone,
            "resume": resume,
            "message": message,
            "jobId": job_id,
            "jobTitle": job_title,
            "createdAt": datetime.datetime.utcnow(),
        }
        db.applications.insert_one(application_doc)

        # Build application html email body
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="color: #1a1a2e; border-bottom: 2px solid #c9a84c; padding-bottom: 8px; margin-top: 0;">
            New Job Application — Elysa Consultants
          </h2>
          <p style="font-size: 15px; color: #333;">
            You have received a new job application for the position: <strong>{job_title}</strong>
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555; width: 150px; border-bottom: 1px solid #eee;">Position:</td>
              <td style="padding: 10px; color: #222; font-weight: bold; border-bottom: 1px solid #eee;">{job_title}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Candidate Name:</td>
              <td style="padding: 10px; color: #222; border-bottom: 1px solid #eee;">{name}</td>
            </tr>
            <tr style="background: #fdfdfd;">
              <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Email:</td>
              <td style="padding: 10px; color: #222; border-bottom: 1px solid #eee;">
                <a href="mailto:{email}" style="color: #c9a84c;">{email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Phone Number:</td>
              <td style="padding: 10px; color: #222; border-bottom: 1px solid #eee;">
                <a href="tel:{phone}" style="color: #c9a84c;">{phone}</a>
              </td>
            </tr>
            <tr style="background: #fdfdfd;">
              <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Resume / Link:</td>
              <td style="padding: 10px; color: #222; border-bottom: 1px solid #eee;">
                {f'<a href="{resume}" target="_blank" style="color: #c9a84c; text-decoration: underline;">{resume}</a>' if resume else 'Not Provided'}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555; vertical-align: top; padding-top: 10px;">Cover Letter:</td>
              <td style="padding: 10px; color: #222; white-space: pre-wrap; line-height: 1.6;">{message or "None"}</td>
            </tr>
          </table>
          <p style="color: #888; font-size: 13px; margin-top: 24px;">
            Reply directly to this email to contact the candidate.
          </p>
          <p style="color: #888; font-size: 12px;">
            Sent via Elysa Consultants website Careers portal.
          </p>
        </div>
        """

        # Dispatch async email via helper
        send_email_async(
            subject=f"New Job Application for {job_title} from {name}",
            html_body=html_body,
            reply_to=email,
            from_name=f"{name} via Elysa Careers"
        )

        return jsonify({"message": "Your application has been submitted successfully!"}), 200

    except Exception as e:
        print("APPLY ERROR:", e)
        return jsonify({"message": "Failed to submit application. Please try again."}), 500
