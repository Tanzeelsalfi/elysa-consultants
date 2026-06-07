FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install OS build deps needed by Pillow and cryptography
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libjpeg-dev \
       zlib1g-dev \
       libpng-dev \
       ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python deps
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY backend /app

# Ensure uploads directory exists
RUN mkdir -p /app/static/uploads

EXPOSE 10000

CMD ["gunicorn", "your_application.wsgi", "--bind", "0.0.0.0:$PORT", "--workers", "3"]
