import os
import time
from flask import Flask, jsonify, send_from_directory, make_response
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)

# Lazy DB initialization — initialize on first request to avoid startup failures on platforms like Render
db_conn = None
db_initialized = False

def init_db_and_seed():
    global db_conn, db_initialized
    if db_initialized:
        return
    try:
        from config.db import get_db, seed_projects_if_empty, seed_employees_if_empty
        db_conn = get_db()
        import threading
        def seed_bg():
            try:
                seed_projects_if_empty(db_conn)
                seed_employees_if_empty(db_conn)
            except Exception as e:
                print("Background seeding error:", e)
        threading.Thread(target=seed_bg, daemon=True).start()
        db_initialized = True
    except Exception as e:
        # Do not crash the app on startup; log and continue. Endpoints should handle lack of DB.
        print("Database initialization skipped or failed:", e)

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback-secret-key")
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50MB max upload

# Rate limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# CORS — restrict in production
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize DB lazily before the first request
@app.before_request
def ensure_db_initialized():
    init_db_and_seed()

# ── Security Headers Middleware ─────────────────────────────────────────────
@app.after_request
def apply_security_headers(response):
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
        "img-src 'self' data: https://images.unsplash.com; "
        "connect-src 'self';"
    )
    return response

# ── API Routes ───────────────────────────────────────────────────────────────
from routes.feedback import feedback_bp
from routes.projects import projects_bp
from routes.contact import contact_bp
from routes.admin import admin_bp
from routes.employees import employees_bp
from routes.careers import careers_bp
from routes.reviews import reviews_bp

app.register_blueprint(feedback_bp, url_prefix="/api/feedback")
app.register_blueprint(projects_bp, url_prefix="/api/projects")
app.register_blueprint(contact_bp, url_prefix="/api/contact")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(employees_bp, url_prefix="/api/employees")
app.register_blueprint(careers_bp, url_prefix="/api/careers")
app.register_blueprint(reviews_bp, url_prefix="/api/reviews")

# ── Page Routes (serve HTML templates) ──────────────────────────────────────
from flask import render_template

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/projects")
def projects():
    return render_template("projects.html")

@app.route("/services")
def services():
    return render_template("services.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/career")
def career():
    return render_template("career.html")

@app.route("/admin")
def admin_dashboard():
    return render_template("admin/dashboard.html")

@app.route("/admin/login")
def admin_login_page():
    return render_template("admin/login.html")

# ── Uploaded images ──────────────────────────────────────────────────────────
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(
        os.path.join(app.root_path, "static", "uploads"),
        filename
    )

# ── Health check ─────────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "timestamp": int(time.time())}), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
