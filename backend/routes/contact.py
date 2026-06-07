import os
import smtplib
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from flask import Blueprint, request, jsonify

contact_bp = Blueprint("contact", __name__)

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

def send_contact_email(visitor_name, visitor_email, message):
    email_user = os.getenv("EMAIL_USER")
    email_pass = os.getenv("EMAIL_PASS")

    if not email_user or not email_pass:
        print("EMAIL_USER or EMAIL_PASS not set — skipping email.")
        return

    subject = f"New Contact Message from {visitor_name}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
      <h2 style="color: #1a1a2e; border-bottom: 2px solid #c9a84c; padding-bottom: 8px;">
        New Contact Message — Elysa Consultants
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555; width: 130px;">Name:</td>
          <td style="padding: 10px; color: #222;">{visitor_name}</td>
        </tr>
        <tr style="background: #f0f0f0;">
          <td style="padding: 10px; font-weight: bold; color: #555;">Email:</td>
          <td style="padding: 10px; color: #222;">
            <a href="mailto:{visitor_email}" style="color: #c9a84c;">{visitor_email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555;">Message:</td>
          <td style="padding: 10px; color: #222;">{message}</td>
        </tr>
      </table>
      <p style="color: #888; font-size: 13px; margin-top: 24px;">
        Reply directly to this email to respond to {visitor_name} at {visitor_email}.
      </p>
      <p style="color: #888; font-size: 12px;">
        Sent via Elysa Consultants website contact form.
      </p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["From"] = email_user
    msg["To"] = email_user          # Send TO admin inbox
    msg["Reply-To"] = visitor_email  # So admin can reply directly to visitor
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=5) as server:
            server.starttls()
            server.login(email_user, email_pass)
            server.send_message(msg)
            print(f"Contact email sent from {visitor_email}")
    except Exception as e:
        print("SMTP SEND ERROR (Email Notification Failed):", e)


@contact_bp.route("", methods=["POST"])
@contact_bp.route("/", methods=["POST"])
def submit_contact():
    try:
        data = request.get_json() or {}

        name = sanitize(data.get("name", ""), 100)
        email = sanitize(data.get("email", ""), 200)
        phone = sanitize(data.get("phone", ""), 20)
        message = sanitize(data.get("message", ""), 2000)

        # Validation
        if not name or not email or not message:
            return jsonify({"message": "Name, email, and message are required."}), 400

        if not is_valid_email(email):
            return jsonify({"message": "Please enter a valid email address."}), 400

        if len(message) < 10:
            return jsonify({"message": "Message is too short."}), 400

        # Save to database
        from config.db import get_db
        db = get_db()
        contact_doc = {
            "name": name,
            "email": email,
            "phone": phone,
            "message": message,
            "createdAt": datetime.utcnow(),
        }
        db.contacts.insert_one(contact_doc)

        # Send email to admin in a background thread to avoid blocking the response
        import threading
        threading.Thread(target=send_contact_email, args=(name, email, message), daemon=True).start()

        return jsonify({"message": "Your message has been sent successfully!"}), 200

    except Exception as e:
        print("CONTACT ERROR:", e)
        return jsonify({"message": "Failed to send message. Please try again."}), 500
