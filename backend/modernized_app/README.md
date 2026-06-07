# Elysa Consultants — Modernized Next.js Application

A modernized, lightweight, serverless Next.js rewrite of the original Python Flask and MongoDB application. It is optimized for static hosting and serverless deployment with low maintenance costs.

---

## 🚀 Key Features

* **Framework**: Next.js App Router (TypeScript) with optimized SSG/SSR pages.
* **Styling**: Tailwind CSS integration with dedicated custom dark-mode variables.
* **Database**: MongoDB Atlas using Mongoose schemas.
* **Image Uploads**: Integrated with Cloudinary (no local disk dependency; safe for serverless runtimes).
* **Security & Auth**: JWT-based session cookies (HTTP-only) for administrator dashboards.
* **Mail Notifications**: Nodemailer-powered asynchronous SMTP lead dispatch.
* **Real-Time Synchronizers**: EventSource listener syncing project additions and deletions instantly.

---

## 📂 Project Structure

```text
/modernized_app
  ├── app/                  # Next.js App Router (Pages, Admin panel, Serverless APIs)
  │    ├── api/             # Serverless backend routes
  │    ├── admin/           # Admin Dashboard and Login layouts
  │    ├── globals.css      # Core styles
  │    └── page.tsx         # User-facing website pages
  ├── components/           # Reusable UI React components (Sliders, Lightbox)
  ├── lib/                  # Connection clients (database, auth, cloudinary)
  ├── models/               # Mongoose model definitions
  ├── public/               # Static image assets and logo placeholders
  ├── docs/                 # Migration notes & Vercel deployment guide
  ├── .env.example          # Sample environment configuration template
  └── README.md             # Project documentation
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
Ensure you have **Node.js 18.x or later** and **npm** installed.

### 2. Configure Environment Variables
Copy `.env.example` into a new file named `.env`:
```bash
cp .env.example .env
```
Fill in the configuration parameters inside `.env` including your **MONGO_URI**, **Cloudinary API keys**, and **Gmail SMTP settings**.

### 3. Install Dependencies
Navigate into the modernized app directory and run:
```bash
npm install
```

### 4. Run the Dev Server
Launch the local development environment:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 📦 Production Build & Testing

Validate that all TypeScript components compile cleanly for production:
```bash
npm run build
```

---

## ☁️ Deployment on Vercel

1. Push this project folder to your GitHub.
2. Go to **Vercel** and select **Add New > Project**.
3. Import the repository and set the **Root Directory** to `backend/modernized_app`.
4. Add all environment variables listed in `.env.example`.
5. Click **Deploy**. Vercel will automatically compile the site and provision serverless functions.
