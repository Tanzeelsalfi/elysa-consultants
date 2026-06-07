#!/bin/bash
# Elysa Consultants — Start Backend Server

cd "$(dirname "$0")"

# Activate virtual environment
if [ -d "../venv" ]; then
    source ../venv/bin/activate
    echo "✅ Virtual environment activated"
elif [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "⚠️  No virtual environment found. Using system Python."
fi

# Load env
if [ -f ".env" ]; then
    echo "✅ Loading .env"
fi

echo "🚀 Starting Elysa Consultants backend on http://localhost:8000"
echo "📋 Admin dashboard: http://localhost:8000/admin/login"
echo ""

python app.py
