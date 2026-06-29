import os
import sys
import socket
import smtplib
import threading
import urllib.request
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr

def send_email_async(subject, html_body, reply_to=None, from_name="Elysa Website"):
    """Sends an email asynchronously in a background thread."""
    threading.Thread(
        target=send_email_sync,
        args=(subject, html_body, reply_to, from_name),
        daemon=True
    ).start()

def send_email_sync(subject, html_body, reply_to=None, from_name="Elysa Website"):
    email_user = os.getenv("EMAIL_USER")
    email_pass = os.getenv("EMAIL_PASS")
    resend_api_key = os.getenv("RESEND_API_KEY")

    # ── MODE 1: RESEND HTTP API (Bypasses Render Free Tier SMTP Blocks) ────────────
    if resend_api_key:
        print("[MAIL INFO] RESEND_API_KEY detected. Using Resend HTTPS API...", flush=True)
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {resend_api_key}",
            "Content-Type": "application/json"
        }
        
        # Resend Free Tier uses onboarding@resend.dev. To send from your own domain,
        # you verify it on Resend dashboard and specify it via RESEND_FROM_EMAIL.
        from_email = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
        to_email = email_user if email_user else "elyasaconsultants@gmail.com"
        
        payload = {
            "from": f"{from_name} <{from_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html_body
        }
        if reply_to:
            payload["reply_to"] = reply_to

        try:
            req = urllib.request.Request(
                url, 
                data=json.dumps(payload).encode("utf-8"), 
                headers=headers, 
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                print(f"[MAIL SUCCESS] Email sent via Resend API: ID {resp_data.get('id')}", flush=True)
                return True
        except Exception as e:
            print(f"[MAIL RESEND ERROR] Resend API failed: {e}", file=sys.stderr, flush=True)
            print("[MAIL INFO] Attempting SMTP fallback...", flush=True)

    # ── MODE 2: STANDARD SMTP (SSL on Port 465) ──────────────────────────────────
    if not email_user or not email_pass:
        print("[MAIL ERROR] SMTP credentials not set (EMAIL_USER/EMAIL_PASS). Email notification skipped.", file=sys.stderr, flush=True)
        print("[MAIL INFO] Configure EMAIL_USER and EMAIL_PASS for SMTP. If using Render Free tier, sign up for Resend and set RESEND_API_KEY instead.", file=sys.stderr, flush=True)
        return False

    msg = MIMEMultipart("alternative")
    msg["From"] = formataddr((from_name, email_user))
    msg["To"] = email_user
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
        
    msg.attach(MIMEText(html_body, "html"))

    # Determine environment: Force IPv4 DNS resolution only on Render to bypass IPv6 unreachable errors.
    # Keep standard hostname lookup locally to avoid Google SMTP raw IP connection timeouts.
    is_render = os.getenv("RENDER") is not None
    if is_render:
        try:
            hosts = socket.getaddrinfo("smtp.gmail.com", 465, family=socket.AF_INET, proto=socket.IPPROTO_TCP)
            target_host = hosts[0][4][0]
        except Exception as dns_err:
            print(f"[MAIL DNS WARNING] Failed to resolve smtp.gmail.com to IPv4. Using fallback. Details: {dns_err}", file=sys.stderr, flush=True)
            target_host = "smtp.gmail.com"
    else:
        target_host = "smtp.gmail.com"

    try:
        # Use SMTP_SSL on port 465 (widely supported by local ISPs/networks that block port 587)
        with smtplib.SMTP_SSL(target_host, 465, timeout=10) as server:
            server.login(email_user, email_pass)
            server.send_message(msg)
            print(f"[MAIL SUCCESS] Email sent successfully via SMTP SSL (465): '{subject}'", flush=True)
            return True
    except Exception as e:
        print(f"[MAIL SMTP ERROR] Failed to send email '{subject}' via SMTP SSL. Error details: {e}", file=sys.stderr, flush=True)
        return False
