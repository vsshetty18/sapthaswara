# SvaraVerse AI - Local Setup Guide

This guide walks through setting up the full SvaraVerse AI project (frontend, backend, database) on your local machine.

---

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL client tools (`psql`) or a Supabase account
- Firebase project (Authentication + Storage + Cloud Messaging enabled)
- OpenAI API key
- Razorpay account (test mode keys)
- YouTube Data API v3 key (Google Cloud Console)
- Instagram Graph API access token (Meta Developer App)
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-org/svaraverse.git
cd svaraverse
```

---

## 2. Database Setup (Supabase PostgreSQL)

1. Create a new project at [supabase.com](https://supabase.com).
2. Copy the connection string from **Project Settings > Database**.
3. Run the schema:

```bash
psql "postgresql://postgres:<password>@db.<project_ref>.supabase.co:5432/postgres" -f database/schema.sql
```

4. (Optional) Seed sample data:

```bash
psql "postgresql://postgres:<password>@db.<project_ref>.supabase.co:5432/postgres" -f database/seed.sql
```

5. Alternatively, run migrations individually in order:

```bash
for f in database/migrations/*.sql; do
  psql "$DATABASE_URL" -f "$f"
done
```

---

## 3. Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication** → Email/Password + Google providers.
3. Enable **Storage** and create a default bucket.
4. Enable **Cloud Messaging**.
5. Generate a service account key: **Project Settings > Service Accounts > Generate new private key**. Save as `firebase-service-account.json` (do not commit this file).
6. Copy the web app config for the frontend (`apiKey`, `authDomain`, `projectId`, etc.).

---

## 4. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env` with:
- `DATABASE_URL` (from Supabase)
- Firebase Admin credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`)
- `OPENAI_API_KEY`
- `YOUTUBE_API_KEY`
- `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- SMTP credentials for email

Run the dev server:

```bash
npm run dev
```

Server runs at `http://localhost:5000`. Verify with:

```bash
curl http://localhost:5000/health
```

---

## 5. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Fill in `.env.local` with:
- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- Firebase web config (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

Run the dev server:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## 6. Mobile App (React Native)

```bash
cd mobile
npm install
npx pod-install ios   # macOS only, for iOS dependencies
```

Update `mobile/.env` with the same API URL and Firebase config (use platform-specific `google-services.json` for Android and `GoogleService-Info.plist` for iOS, placed in their respective native folders).

Run:

```bash
npx react-native run-android
# or
npx react-native run-ios
```

---

## 7. Third-Party API Configuration Notes

### YouTube Data API
- Enable "YouTube Data API v3" in Google Cloud Console.
- Create an API key restricted to that API.

### Instagram Graph API
- Requires a Meta Developer App with Instagram Graph API product added.
- The connected Instagram account must be a **Business** or **Creator** account linked to a Facebook Page.
- Access tokens expire — implement long-lived token refresh in production.

### Razorpay
- Use test mode keys during development (`rzp_test_...`).
- Configure webhook URL in Razorpay Dashboard pointing to `POST /api/payments/webhook`.

---

## 8. Verifying the Full Stack

1. Backend health check: `GET http://localhost:5000/health`
2. Frontend loads at `http://localhost:3000`
3. Sign up a test user via the UI
4. Confirm the user row appears in the `users` table (Supabase Table Editor)
5. Test an AI Coach endpoint (e.g., daily motivation) to confirm OpenAI key works
6. Test song upload to confirm Firebase Storage is wired up correctly

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `ECONNREFUSED` on DB connection | Check `DATABASE_URL` and Supabase project status |
| Firebase Admin init error | Ensure `FIREBASE_PRIVATE_KEY` has literal `\n` preserved in `.env` |
| CORS errors on frontend | Confirm `FRONTEND_URL` in backend `.env` matches your frontend origin |
| OpenAI 401 errors | Verify `OPENAI_API_KEY` is active and has billing enabled |
| Razorpay signature mismatch | Ensure webhook secret matches Razorpay Dashboard configuration |
