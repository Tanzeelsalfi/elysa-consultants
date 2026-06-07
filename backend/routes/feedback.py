import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from flask import Blueprint, request, jsonify
from config.db import get_db

feedback_bp = Blueprint("feedback", __name__)

def send_lead_email(name, phone, project):
    email_user = os.getenv("EMAIL_USER")
    email_pass = os.getenv("EMAIL_PASS")
    
    if not email_user or not email_pass:
        print("EMAIL_USER or EMAIL_PASS environment variables are not set. Skipping email.")
        return
        
    subject = "New Website Lead"
    html_body = f"""
    <h2>New Client Inquiry</h2>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Phone:</strong> {phone}</p>
    <p><strong>Project:</strong> {project}</p>
    """
    
    msg = MIMEMultipart()
    msg["From"] = email_user
    msg["To"] = email_user
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))
    
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=5) as server:
            server.starttls()
            server.login(email_user, email_pass)
            server.send_message(msg)
            print("Lead notification email sent successfully!")
    except Exception as e:
        print("SMTP SEND ERROR (Lead Notification Failed):", e)

@feedback_bp.route("", methods=["POST"])
@feedback_bp.route("/", methods=["POST"])
def submit_feedback():
    try:
        data = request.json or {}
        name = data.get("name")
        phone = data.get("phone")
        project = data.get("project")
        
        if not name or not phone or not project:
            return jsonify({"message": "All fields are required"}), 400
            
        db = get_db()
        feedback_doc = {
            "name": name,
            "phone": phone,
            "project": project,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        db.feedbacks.insert_one(feedback_doc)
        
        # Send lead email in a background thread to prevent blocking
        import threading
        threading.Thread(target=send_lead_email, args=(name, phone, project), daemon=True).start()
        
        return jsonify({"message": "Lead Submitted Successfully"}), 200
    except Exception as e:
        print("FEEDBACK/EMAIL ERROR:", e)
        return jsonify({"message": "Server Error"}), 500
