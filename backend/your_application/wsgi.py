# WSGI entrypoint expected by Render: gunicorn your_application.wsgi
# Imports the Flask app instance from app.py and exposes it as `application`.

from app import app as application
