# Deployment Guide — Next.js Serverless App

This guide outlines steps for deploying the modernized **Elysa Consultants** Next.js application to **Vercel** or **Cloudflare Pages**, configuring remote cloud database access, and integrating Cloudinary.

---

## 1. MongoDB Atlas Preparation

Since Next.js Serverless functions execute in dynamic environments, they will connect from arbitrary IP addresses.

1. Log in to your **MongoDB Atlas** console.
2. Go to **Network Access** under the Security tab in the sidebar.
3. Click **Add IP Address** and select **Allow Access From Anywhere** (`0.0.0.0/0`). 
4. Ensure your Database User has the appropriate read/write privileges to write to `architectDB`.

---

## 2. Cloudinary Setup

To store uploaded project images and team member photos:

1. Sign up for a free account at **[Cloudinary](https://cloudinary.com/)**.
2. From the Dashboard, copy the following credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. These variables will be pasted into your Vercel deployment variables (see below).

---

## 3. Deployment on Vercel (Recommended)

Vercel provides native Next.js support and hosts serverless APIs out of the box.

### Step 1: Connect your Repository
1. Push your updated code containing the `/modernized_app` folder to GitHub.
2. Go to your **Vercel Dashboard** and click **Add New > Project**.
3. Import your Git repository.

### Step 2: Configure Project Settings
1. Set the **Framework Preset** to **Next.js**.
2. Edit the **Root Directory** settings to point to `backend/modernized_app` (or just `modernized_app` depending on your repo structure).

### Step 3: Add Environment Variables
Add the following keys in the Vercel **Environment Variables** panel:

| Name | Description | Example |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Atlas URI string | `mongodb+srv://admin:pwd@cluster0...` |
| `ADMIN_USERS` | Credentials for dashboard | `admin:password123,aakhoon:Rashiq@2026` |
| `JWT_SECRET` | Secret token to encrypt sessions | `generate_some_long_random_hash` |
| `EMAIL_USER` | Admin email address | `aakhoonrashiq@gmail.com` |
| `EMAIL_PASS` | Gmail App Password (16 characters) | `ynpjxpwhvslvxeog` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your-api-secret-key` |

### Step 4: Deploy
Click **Deploy**. Vercel will build the frontend, optimize static content, and deploy the backend APIs as serverless functions.
