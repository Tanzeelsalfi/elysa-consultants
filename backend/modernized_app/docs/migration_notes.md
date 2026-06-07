# Migration Notes — Flask to Next.js Serverless Transition

This document outlines the architectural changes, database mappings, and design choices made during the migration of the Elysa Consultants web application.

---

## 1. Architectural Changes

| Feature | Original Monolithic App | Modernized Serverless App |
| :--- | :--- | :--- |
| **Backend Runtime** | Python (Flask Server) | Node.js (Serverless API Routes in Next.js) |
| **Host / Cost** | Requires persistent server (e.g. Render / Heroku) | Can be hosted entirely on Vercel or Cloudflare Pages (Free Tier) |
| **Routing & Engine** | Jinja2 HTML rendering in Flask | Next.js App Router (React Components, optimized SSG/SSR) |
| **Aesthetics** | CSS Style sheet | Tailwind CSS + custom CSS variables (Playfair Display & Inter) |
| **Development** | Dynamic Flask reload | Next.js Fast Refresh & Hot Module Replacement |

---

## 2. Database Schema & Collections

The MongoDB collections are reused and mapped directly inside Next.js using **Mongoose** (with complete TypeScript types):

1. **`projects`**:
   - Stores Title, Description, Category, Image URL arrays, and Timestamps.
   - Migrated from raw PyMongo objects to `Project` mongoose model.
2. **`employees`**:
   - Represents the team members.
   - Reuses the exact collection name `"employees"` to avoid collisions.
3. **`contacts`**:
   - Stores general contact inquiries.
   - Reuses `"contacts"` collection.
4. **`feedbacks`**:
   - Stores lead/feedback messages.
   - Reuses `"feedbacks"` collection.

---

## 3. Key Enhancements

### 1. Image Storage (Cloudinary Integration)
* **Before**: Images were uploaded directly to the local server disk under `/static/uploads`. In serverless platforms like Vercel, the local filesystem is **read-only** and **ephemeral** (files disappear when the container restarts).
* **Now**: Admin uploads are streamed as a buffer to **Cloudinary**. The application stores only the secure remote URLs in MongoDB. Unused images are automatically purged from Cloudinary when projects are updated or deleted, saving space.

### 2. JWT Authentication
* **Before**: Logins were handled using Flask cookie sessions, verifying credentials against the `.env` `ADMIN_USERS` setting.
* **Now**: Handled in a serverless endpoint `/api/admin/login` which verifies credentials and sets an **HTTP-only, Secure, SameSite=Strict** cookie containing the signed JWT token.

### 3. Serverless SMTP Notifications
* **Before**: Lead alerts were dispatched using a background thread (`threading.Thread`) via SMTP.
* **Now**: Implemented asynchronously using **Nodemailer** directly in serverless API routes, ensuring the container remains active until emails are dispatched.

### 4. Real-Time Events (SSE Stream)
* **Before**: Flask server-sent events stream checked the count every 3 seconds and kept connection threads open indefinitely.
* **Now**: Built with Next.js App Router using `ReadableStream` yielding heartbeats. Fallback client-side polling is integrated if the serverless connection terminates due to execution limits.
