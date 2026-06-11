import os
import jwt
import re
import uuid
import datetime
import base64
from functools import wraps
from flask import Blueprint, request, jsonify, make_response, Response
from werkzeug.utils import secure_filename
from bson import ObjectId
from config.db import get_db

admin_bp = Blueprint("admin", __name__)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "static", "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ── MULTI-USER AUTH HELPER ────────────────────────────────────────────────────
def get_authorized_users():
    """
    Reads ADMIN_USERS from .env in format:
      username1:password1,username2:password2
    Returns a dict: { username: password }
    """
    raw = os.getenv("ADMIN_USERS", "admin:admin123")
    users = {}
    for entry in raw.split(","):
        entry = entry.strip()
        if ":" in entry:
            uname, pwd = entry.split(":", 1)
            users[uname.strip()] = pwd.strip()
    return users


def validate_credentials(username, password):
    """Returns True if username+password match any authorized user."""
    users = get_authorized_users()
    return users.get(username) == password


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def serialize_doc(doc):
    if not doc:
        return doc
    doc["_id"] = str(doc["_id"])
    for key, val in doc.items():
        if isinstance(val, datetime.datetime):
            doc[key] = val.isoformat()
    return doc


# ── JWT AUTH DECORATOR ────────────────────────────────────────────────────────
def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get("admin_token")
        if not token:
            token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"message": "Unauthorized"}), 401
        try:
            secret = os.getenv("JWT_SECRET", "fallback_secret")
            payload = jwt.decode(token, secret, algorithms=["HS256"])
            if payload.get("role") != "admin":
                return jsonify({"message": "Forbidden"}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Session expired. Please login again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


# ── ADMIN LOGIN ───────────────────────────────────────────────────────────────
@admin_bp.route("/login", methods=["POST"])
def admin_login():
    try:
        data = request.get_json() or {}
        username = str(data.get("username", "")).strip()
        password = str(data.get("password", "")).strip()

        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        if not validate_credentials(username, password):
            return jsonify({"message": "Invalid credentials. Access denied."}), 401

        secret = os.getenv("JWT_SECRET", "fallback_secret")
        token = jwt.encode(
            {
                "role": "admin",
                "sub": username,
                "iat": datetime.datetime.utcnow(),
                "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
            },
            secret,
            algorithm="HS256",
        )

        response = make_response(jsonify({
            "message": "Login successful",
            "token": token,
            "username": username
        }))
        response.set_cookie(
            "admin_token",
            token,
            httponly=True,
            secure=False,      # Set to True in production (HTTPS)
            samesite="Strict",
            max_age=7 * 24 * 3600  # 7 days
        )
        return response, 200

    except Exception as e:
        print("ADMIN LOGIN ERROR:", e)
        return jsonify({"message": "Login failed"}), 500


# ── ADMIN LOGOUT ──────────────────────────────────────────────────────────────
@admin_bp.route("/logout", methods=["POST"])
def admin_logout():
    response = make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie("admin_token")
    return response, 200


# ── VERIFY TOKEN ──────────────────────────────────────────────────────────────
@admin_bp.route("/verify", methods=["GET"])
@require_admin
def verify_token():
    token = request.cookies.get("admin_token") or \
            request.headers.get("Authorization", "").replace("Bearer ", "")
    secret = os.getenv("JWT_SECRET", "fallback_secret")
    payload = jwt.decode(token, secret, algorithms=["HS256"])
    return jsonify({"message": "Valid", "role": "admin", "username": payload.get("sub")}), 200


# ── LIST AUTHORIZED USERS (names only, no passwords) ─────────────────────────
@admin_bp.route("/users", methods=["GET"])
@require_admin
def list_users():
    users = list(get_authorized_users().keys())
    return jsonify({"users": users, "count": len(users)}), 200


# ── GET ALL PROJECTS (Admin) ──────────────────────────────────────────────────
@admin_bp.route("/projects", methods=["GET"])
@require_admin
def admin_get_projects():
    try:
        db = get_db()
        projects = [serialize_doc(doc) for doc in db.projects.find().sort("createdAt", -1)]
        return jsonify(projects), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ── ADD PROJECT ───────────────────────────────────────────────────────────────
@admin_bp.route("/projects", methods=["POST"])
@require_admin
def admin_add_project():
    try:
        db = get_db()

        title       = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        category    = request.form.get("category", "General").strip()

        if not title or not description:
            return jsonify({"message": "Title and description are required"}), 400

        # Handle image uploads
        images = []
        files = request.files.getlist("images")
        for file in files:
            if file and file.filename:
                if not allowed_file(file.filename):
                    return jsonify({"message": f"Invalid file format: {file.filename}. Allowed: jpg, jpeg, png, webp"}), 400
                mimetype = file.content_type or "image/jpeg"
                file_bytes = file.read()
                base64_data = base64.b64encode(file_bytes).decode("utf-8")
                images.append(f"data:{mimetype};base64,{base64_data}")

        if not images:
            return jsonify({"message": "At least one image is required"}), 400

        now = datetime.datetime.utcnow()
        project = {
            "title":       title,
            "description": description,
            "category":    category,
            "images":      images,
            "createdAt":   now,
            "updatedAt":   now,
        }

        result = db.projects.insert_one(project)
        project["_id"]       = str(result.inserted_id)
        project["createdAt"] = now.isoformat()
        project["updatedAt"] = now.isoformat()

        return jsonify(project), 201

    except Exception as e:
        print("ADD PROJECT ERROR:", e)
        return jsonify({"message": str(e)}), 500


# ── DELETE PROJECT ─────────────────────────────────────────────────────────────
@admin_bp.route("/projects/<id>", methods=["DELETE"])
@require_admin
def admin_delete_project(id):
    try:
        db = get_db()
        result = db.projects.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"message": "Project not found"}), 404
        return jsonify({"message": "Project deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ── UPDATE PROJECT ────────────────────────────────────────────────────────────
@admin_bp.route("/projects/<id>", methods=["PUT", "POST"])
@require_admin
def admin_update_project(id):
    try:
        db = get_db()
        project = db.projects.find_one({"_id": ObjectId(id)})
        if not project:
            return jsonify({"message": "Project not found"}), 404

        title       = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        category    = request.form.get("category", "").strip()

        # Parse existing images to keep
        keep_images = request.form.getlist("keep_images")
        
        # If no keep_images is sent, check if it's a JSON string or comma separated
        if len(keep_images) == 1 and (keep_images[0].startswith("[") or "," in keep_images[0]):
            import json
            try:
                keep_images = json.loads(keep_images[0])
            except ValueError:
                keep_images = [x.strip() for x in keep_images[0].split(",") if x.strip()]
        elif not keep_images and request.form.get("keep_images"):
            # try to parse as JSON directly if single string
            import json
            try:
                keep_images = json.loads(request.form.get("keep_images"))
            except ValueError:
                keep_images = [x.strip() for x in request.form.get("keep_images").split(",") if x.strip()]

        existing_images = project.get("images", [])
        updated_images = [img for img in existing_images if img in keep_images]

        # Handle new image uploads
        files = request.files.getlist("images")
        for file in files:
            if file and file.filename:
                if not allowed_file(file.filename):
                    return jsonify({"message": f"Invalid file format: {file.filename}. Allowed: jpg, jpeg, png, webp"}), 400
                mimetype = file.content_type or "image/jpeg"
                file_bytes = file.read()
                base64_data = base64.b64encode(file_bytes).decode("utf-8")
                updated_images.append(f"data:{mimetype};base64,{base64_data}")

        if not updated_images:
            return jsonify({"message": "At least one image is required"}), 400

        update_doc = {
            "updatedAt": datetime.datetime.utcnow()
        }
        if title:
            update_doc["title"] = title
        if description:
            update_doc["description"] = description
        if category:
            update_doc["category"] = category
            
        update_doc["images"] = updated_images

        db.projects.update_one({"_id": ObjectId(id)}, {"$set": update_doc})

        updated_project = db.projects.find_one({"_id": ObjectId(id)})
        return jsonify(serialize_doc(updated_project)), 200

    except Exception as e:
        print("UPDATE PROJECT ERROR:", e)
        return jsonify({"message": str(e)}), 500


# ── PROJECT COUNT (used by frontend for polling) ───────────────────────────────
@admin_bp.route("/projects/count", methods=["GET"])
@require_admin
def admin_project_count():
    try:
        db = get_db()
        count = db.projects.count_documents({})
        return jsonify({"count": count}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ── GET ALL CONTACTS ──────────────────────────────────────────────────────────
@admin_bp.route("/contacts", methods=["GET"])
@require_admin
def admin_get_contacts():
    try:
        db = get_db()
        contacts = [serialize_doc(doc) for doc in db.contacts.find().sort("createdAt", -1)]
        return jsonify(contacts), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ── GET ALL LEADS ─────────────────────────────────────────────────────────────
@admin_bp.route("/leads", methods=["GET"])
@require_admin
def admin_get_leads():
    try:
        db = get_db()
        leads = [serialize_doc(doc) for doc in db.feedbacks.find().sort("createdAt", -1)]
        return jsonify(leads), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ── GET ALL EMPLOYEES (Admin) ─────────────────────────────────────────────────
@admin_bp.route("/employees", methods=["GET"])
@require_admin
def admin_get_employees():
    try:
        db = get_db()
        employees = [serialize_doc(doc) for doc in db.employees.find()]
        return jsonify(employees), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ── ADD EMPLOYEE ──────────────────────────────────────────────────────────────
@admin_bp.route("/employees", methods=["POST"])
@require_admin
def admin_add_employee():
    try:
        db = get_db()

        name     = request.form.get("name", "").strip()
        position = request.form.get("position", "").strip()
        spec     = request.form.get("spec", "").strip()

        if not name or not position:
            return jsonify({"message": "Name and position are required"}), 400

        # Handle photo upload
        photo_url = ""
        file = request.files.get("photo")
        if file and file.filename:
            if not allowed_file(file.filename):
                return jsonify({"message": "Invalid file format. Allowed: jpg, jpeg, png, webp"}), 400
            mimetype = file.content_type or "image/jpeg"
            file_bytes = file.read()
            base64_data = base64.b64encode(file_bytes).decode("utf-8")
            photo_url = f"data:{mimetype};base64,{base64_data}"

        employee = {
            "name":     name,
            "position": position,
            "spec":     spec,
            "photo":    photo_url
        }

        result = db.employees.insert_one(employee)
        employee["_id"] = str(result.inserted_id)

        return jsonify(employee), 201

    except Exception as e:
        print("ADD EMPLOYEE ERROR:", e)
        return jsonify({"message": str(e)}), 500


# ── DELETE EMPLOYEE ───────────────────────────────────────────────────────────
@admin_bp.route("/employees/<id>", methods=["DELETE"])
@require_admin
def admin_delete_employee(id):
    try:
        db = get_db()
        result = db.employees.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"message": "Employee not found"}), 404
        return jsonify({"message": "Employee deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ── EDIT EMPLOYEE ─────────────────────────────────────────────────────────────
@admin_bp.route("/employees/<id>", methods=["PUT"])
@require_admin
def admin_edit_employee(id):
    try:
        db = get_db()
        employee = db.employees.find_one({"_id": ObjectId(id)})
        if not employee:
            return jsonify({"message": "Employee not found"}), 404

        name     = request.form.get("name", "").strip()
        position = request.form.get("position", "").strip()
        spec     = request.form.get("spec", "").strip()

        update_doc = {}
        if name:
            update_doc["name"] = name
        if position:
            update_doc["position"] = position
        if spec is not None:
            update_doc["spec"] = spec

        # Handle photo upload
        file = request.files.get("photo")
        if file and file.filename:
            if not allowed_file(file.filename):
                return jsonify({"message": "Invalid file format. Allowed: jpg, jpeg, png, webp"}), 400
            mimetype = file.content_type or "image/jpeg"
            file_bytes = file.read()
            base64_data = base64.b64encode(file_bytes).decode("utf-8")
            update_doc["photo"] = f"data:{mimetype};base64,{base64_data}"

        if update_doc:
            db.employees.update_one({"_id": ObjectId(id)}, {"$set": update_doc})

        updated_employee = db.employees.find_one({"_id": ObjectId(id)})
        return jsonify(serialize_doc(updated_employee)), 200

    except Exception as e:
        print("EDIT EMPLOYEE ERROR:", e)
        return jsonify({"message": str(e)}), 500



# ── DELETE CONTACT MESSAGE ────────────────────────────────────────────────────
@admin_bp.route("/contacts/<id>", methods=["DELETE"])
@require_admin
def admin_delete_contact(id):
    try:
        db = get_db()
        result = db.contacts.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"message": "Message not found"}), 404
        return jsonify({"message": "Message deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ── DELETE LEAD ───────────────────────────────────────────────────────────────
@admin_bp.route("/leads/<id>", methods=["DELETE"])
@require_admin
def admin_delete_lead(id):
    try:
        db = get_db()
        result = db.feedbacks.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"message": "Lead not found"}), 404
        return jsonify({"message": "Lead deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ── SERVER-SENT EVENTS — projects change stream for frontend ──────────────────
import time
import json as _json

@admin_bp.route("/projects/stream", methods=["GET"])
def projects_stream():
    """
    SSE endpoint — frontend subscribes and gets notified immediately
    whenever the project count changes (add or delete from admin panel).
    No auth required — only sends project count, not sensitive data.
    """
    def event_generator():
        db = get_db()
        last_count = db.projects.count_documents({})
        yield f"data: {_json.dumps({'count': last_count})}\n\n"

        while True:
            time.sleep(3)   # check every 3 seconds
            try:
                current_count = db.projects.count_documents({})
                if current_count != last_count:
                    last_count = current_count
                    yield f"data: {_json.dumps({'count': current_count, 'changed': True})}\n\n"
                else:
                    # heartbeat every 3s to keep connection alive
                    yield f": heartbeat\n\n"
            except GeneratorExit:
                break
            except Exception:
                break

    return Response(
        event_generator(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control":   "no-cache",
            "X-Accel-Buffering": "no",
            "Connection":      "keep-alive",
        }
    )


# ── CAREER MANAGEMENT (Admin) ─────────────────────────────────────────────────

@admin_bp.route("/careers", methods=["GET"])
@require_admin
def admin_get_careers():
    try:
        db = get_db()
        careers = [serialize_doc(doc) for doc in db.careers.find().sort("createdAt", -1)]
        return jsonify(careers), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@admin_bp.route("/careers", methods=["POST"])
@require_admin
def admin_add_career():
    try:
        db = get_db()
        data = request.get_json() or {}

        title       = str(data.get("title", "")).strip()
        description = str(data.get("description", "")).strip()
        skills_raw  = data.get("skills", [])
        location    = str(data.get("location", "Kashmir, India")).strip()
        job_type    = str(data.get("type", "full-time")).strip().lower()

        if not title or not description:
            return jsonify({"message": "Title and description are required"}), 400

        # Accept skills as a list or comma-separated string
        if isinstance(skills_raw, str):
            skills = [s.strip() for s in skills_raw.split(",") if s.strip()]
        else:
            skills = [str(s).strip() for s in skills_raw if str(s).strip()]

        now = datetime.datetime.utcnow()
        career = {
            "title":       title,
            "description": description,
            "skills":      skills,
            "location":    location,
            "type":        job_type,
            "createdAt":   now,
            "updatedAt":   now,
        }

        result = db.careers.insert_one(career)
        career["_id"]       = str(result.inserted_id)
        career["createdAt"] = now.isoformat()
        career["updatedAt"] = now.isoformat()

        return jsonify(career), 201

    except Exception as e:
        print("ADD CAREER ERROR:", e)
        return jsonify({"message": str(e)}), 500


@admin_bp.route("/careers/<id>", methods=["PUT"])
@require_admin
def admin_edit_career(id):
    try:
        db = get_db()
        career = db.careers.find_one({"_id": ObjectId(id)})
        if not career:
            return jsonify({"message": "Career not found"}), 404

        data = request.get_json() or {}

        title       = str(data.get("title", "")).strip()
        description = str(data.get("description", "")).strip()
        skills_raw  = data.get("skills", None)
        location    = str(data.get("location", "")).strip()
        job_type    = str(data.get("type", "")).strip().lower()

        update_doc = {"updatedAt": datetime.datetime.utcnow()}

        if title:
            update_doc["title"] = title
        if description:
            update_doc["description"] = description
        if skills_raw is not None:
            if isinstance(skills_raw, str):
                update_doc["skills"] = [s.strip() for s in skills_raw.split(",") if s.strip()]
            else:
                update_doc["skills"] = [str(s).strip() for s in skills_raw if str(s).strip()]
        if location:
            update_doc["location"] = location
        if job_type:
            update_doc["type"] = job_type

        db.careers.update_one({"_id": ObjectId(id)}, {"$set": update_doc})

        updated = db.careers.find_one({"_id": ObjectId(id)})
        return jsonify(serialize_doc(updated)), 200

    except Exception as e:
        print("EDIT CAREER ERROR:", e)
        return jsonify({"message": str(e)}), 500


@admin_bp.route("/careers/<id>", methods=["DELETE"])
@require_admin
def admin_delete_career(id):
    try:
        db = get_db()
        result = db.careers.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"message": "Career not found"}), 404
        return jsonify({"message": "Career deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ── REVIEW MANAGEMENT (Admin) ─────────────────────────────────────────────────
@admin_bp.route("/reviews", methods=["GET"])
@require_admin
def admin_get_reviews():
    try:
        db = get_db()
        reviews = [serialize_doc(doc) for doc in db.reviews.find().sort("createdAt", -1)]
        return jsonify(reviews), 200
    except Exception as e:
        print("GET REVIEWS ERROR:", e)
        return jsonify({"message": str(e)}), 500


@admin_bp.route("/reviews/<id>", methods=["DELETE"])
@require_admin
def admin_delete_review(id):
    try:
        db = get_db()
        result = db.reviews.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"message": "Review not found"}), 404
        return jsonify({"message": "Review deleted successfully"}), 200
    except Exception as e:
        print("DELETE REVIEW ERROR:", e)
        return jsonify({"message": str(e)}), 500
