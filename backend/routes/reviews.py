import datetime
import re
from flask import Blueprint, jsonify, request
from config.db import get_db
from utils.mail import send_email_async

reviews_bp = Blueprint("reviews_public", __name__)


def serialize_review(doc):
    if not doc:
        return doc
    doc["_id"] = str(doc["_id"])
    for k, v in doc.items():
        if isinstance(v, datetime.datetime):
            doc[k] = v.isoformat()
    return doc


def sanitize(text, max_len=1000):
    if not text:
        return ""
    text = str(text).strip()
    text = re.sub(r"[<>\"'`;]", "", text)
    return text[:max_len]


@reviews_bp.route("", methods=["GET"])
@reviews_bp.route("/", methods=["GET"])
def get_reviews():
    try:
        db = get_db()
        reviews = [serialize_review(doc) for doc in db.reviews.find().sort("createdAt", -1)]
        return jsonify(reviews), 200
    except Exception as e:
        print("PUBLIC GET REVIEWS ERROR:", e)
        return jsonify({"message": str(e)}), 500


@reviews_bp.route("", methods=["POST"])
@reviews_bp.route("/", methods=["POST"])
def add_review():
    try:
        data = request.get_json() or {}
        name = sanitize(data.get("name", ""), 100)
        comment = sanitize(data.get("comment", ""), 1000)
        
        try:
            rating = int(data.get("rating"))
        except (ValueError, TypeError):
            return jsonify({"message": "Rating must be a valid integer between 1 and 5."}), 400

        if not name or not comment or not rating:
            return jsonify({"message": "Name, rating, and review comment are required."}), 400

        if rating < 1 or rating > 5:
            return jsonify({"message": "Rating must be between 1 and 5 stars."}), 400

        db = get_db()
        review_doc = {
            "name": name,
            "rating": rating,
            "comment": comment,
            "createdAt": datetime.datetime.utcnow()
        }
        db.reviews.insert_one(review_doc)

        # Build rating stars representation
        star_str = "★" * rating + "☆" * (5 - rating)

        # Build HTML email body
        html_body = f"""
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
              <td style="padding: 10px; color: #222; border-bottom: 1px solid #eee;">{name}</td>
            </tr>
            <tr style="background: #fdfdfd;">
              <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Rating:</td>
              <td style="padding: 10px; color: #f39c12; font-size: 18px; font-weight: bold; border-bottom: 1px solid #eee;">
                {star_str} ({rating}/5 Stars)
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555; vertical-align: top; padding-top: 10px;">Comment:</td>
              <td style="padding: 10px; color: #222; font-style: italic; line-height: 1.6;">"{comment}"</td>
            </tr>
          </table>
          <p style="color: #888; font-size: 12px; margin-top: 24px;">
            Sent via Elysa Consultants website Reviews form.
          </p>
        </div>
        """

        # Dispatch async email via helper
        send_email_async(
            subject=f"New Website Review ({rating}/5 Stars) from {name}",
            html_body=html_body,
            from_name=f"{name} (Review)"
        )

        return jsonify({"message": "Review submitted successfully! Thank you for your feedback."}), 201
    except Exception as e:
        print("PUBLIC POST REVIEW ERROR:", e)
        return jsonify({"message": str(e)}), 500
