# SvaraVerse AI - Deployment Guide

This guide covers deploying SvaraVerse AI to production using Vercel (frontend), Railway/Render (backend), and Supabase (database).

---

## Architecture Overview

---

## 1. Database Deployment (Supabase)

1. Create a production Supabase project (separate from dev/staging).
2. Run `database/schema.sql` against the production instance.
3. Enable **Point-in-Time Recovery** (Supabase Pro plan recommended for production).
4. Set up connection pooling via Supabase's built-in PgBouncer (`?pgbouncer=true` on connection string) for serverless backend connections.
5. Restrict database access via Supabase network restrictions to your backend host IPs where possible.

---

## 2. Backend Deployment (Railway or Render)

### Railway

1. Create a new project → **Deploy from GitHub repo** → select `backend/` as root directory.
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add all environment variables from `.env` (production values) in **Variables** tab.
5. Enable **Health Check** pointing to `/health`.
6. Set up a custom domain (e.g., `api.svaraverse.com`) under **Settings > Networking**.

### Render (alternative)

1. Create a new **Web Service** → connect GitHub repo → root directory `backend/`.
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Add environment variables under **Environment**.
5. Set health check path to `/health`.
6. Add custom domain under **Settings > Custom Domains**.

### Post-Deploy Checklist (Backend)
- [ ] Confirm `/health` returns `200`
- [ ] Confirm `DATABASE_URL` points to production Supabase (with SSL enabled)
- [ ] Confirm Firebase Admin credentials load correctly (check startup logs)
- [ ] Confirm CORS `FRONTEND_URL` matches production frontend domain
- [ ] Rotate `JWT_SECRET` / `JWT_REFRESH_SECRET` from dev values
- [ ] Configure Razorpay webhook URL to production backend URL

---

## 3. Frontend Deployment (Vercel)

1. Import the GitHub repo into Vercel, set **Root Directory** to `frontend/`.
2. Framework preset: **Next.js** (auto-detected).
3. Add environment variables in **Project Settings > Environment Variables**:
   - `NEXT_PUBLIC_API_URL=https://api.svaraverse.com/api`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
4. Set production branch (typically `main`).
5. Add custom domain (e.g., `svaraverse.com`, `www.svaraverse.com`) under **Domains**.
6. Enable **Vercel Analytics** (optional) for performance monitoring.

### Post-Deploy Checklist (Frontend)
- [ ] Landing page loads correctly on custom domain
- [ ] Auth flows (signup/login/Google) work end-to-end against production backend
- [ ] Images/assets load from correct CDN paths
- [ ] Lighthouse score check for performance/accessibility

---

## 4. Mobile App Deployment

### Android (Play Store)
1. Update `mobile/android/app/build.gradle` version code/name.
2. Generate a signed release APK/AAB: `cd android && ./gradlew bundleRelease`
3. Upload to Play Console → Production track.
4. Complete Play Store listing (screenshots, description, privacy policy URL).

### iOS (App Store)
1. Update version/build number in Xcode project settings.
2. Archive build via Xcode → **Product > Archive**.
3. Upload via **Transporter** or Xcode Organizer to App Store Connect.
4. Complete App Store listing and submit for review.

---

## 5. CI/CD (Optional but Recommended)

Use GitHub Actions to automate:
- Run lint/tests on PR
- Auto-deploy `backend/` to Railway/Render on merge to `main`
- Auto-deploy `frontend/` to Vercel on merge to `main` (Vercel does this automatically via Git integration)

Example workflow trigger structure:
