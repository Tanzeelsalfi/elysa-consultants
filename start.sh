#!/usr/bin/env bash
set -e

# Install/ensure build tools available, then start the app
cd backend
python -m pip install --upgrade pip setuptools wheel
# Install gunicorn if not present
python -m pip install --upgrade gunicorn

exec gunicorn app:app --bind 0.0.0.0:${PORT:-8000} --workers 3
