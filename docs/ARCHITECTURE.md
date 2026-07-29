# SvaraVerse AI - Architecture Documentation

## 1. Overview

SvaraVerse AI is a multi-platform (Web, Android, iOS) creator operating system for Indian singers and music creators. It follows a client-server architecture with a shared REST API consumed by Next.js (web) and React Native (mobile).

---

## 2. High-Level System Diagram

                    ┌───────────────────────────┐
                    │        Clients            │
                    │  Web (Next.js)            │
                    │  Android/iOS (React Native)│
                    └──────────────┬────────────┘
                                   │ HTTPS / REST
                    ┌──────────────▼────────────┐
                    │   Backend API (Express)     │
                    │   - Auth Middleware          │
                    │   - Role-Based Access        │
                    │   - Rate Limiting            │
                    └───┬────────┬───────┬───────┘
                        │        │       │
          ┌─────────────┘        │       └─────────────┐
          ▼                      ▼                      ▼
 ┌────────────────┐   ┌──────────────────┐   ┌──────────────────┐
 │ PostgreSQL       │   │ Firebase           │   │ External APIs      │
 │ (Supabase)        │   │ Auth/Storage/FCM   │   │ OpenAI/YouTube/    │
 │                  │   │                    │   │ Instagram/Razorpay │
 └────────────────┘   └──────────────────┘   └──────────────────┘

 ---

## 3. Frontend Architecture (Next.js)

- **App Router** structure with route groups: `(auth)`, `(dashboard)`, `(admin)`, `(owner)` for clear separation of layout and access levels.
- **Context Providers**: `AuthContext` (session/user state), `ThemeContext` (dark/light mode), `AppContext` (global app state like notifications).
- **Services layer** (`services/`): thin wrappers around `fetch`/`axios` calls to the backend, plus direct Firebase SDK calls for auth and storage.
- **Component structure**: `ui/` (design system primitives), feature folders (`dashboard/`, `songs/`, `analytics/`, `ai-coach/`, `milestones/`) for domain-specific components.
- **Styling**: Tailwind CSS with a custom theme extending the Indian premium color palette (beige, sand, cream, warm brown, coffee, dark walnut, gold).

---

## 4. Backend Architecture (Node.js + Express)

Follows an MVC-inspired layered structure:

- **Routes** (`routes/`): define endpoints, apply middleware.
- **Controllers** (`controllers/`): handle request/response, call services/models.
- **Models** (`models/`): direct PostgreSQL query logic (no ORM — raw SQL via `pg` for full control).
- **Services** (`services/`): encapsulate external integrations (OpenAI, YouTube, Instagram, Firebase Storage, FCM notifications).
- **Middleware** (`middleware/`): JWT auth verification, role-based access control, rate limiting, centralized error handling.

### Request Lifecycle

---

## 5. Authentication & Authorization

- **JWT-based sessions**: access token (short-lived) + refresh token (long-lived), issued on login/signup.
- **Firebase Authentication** used for Google OAuth login and as an alternative identity provider; Firebase UID is linked to the `users.firebase_uid` column.
- **Role hierarchy**: `user` → `creator` → `premium` → `admin` → `owner`. Role middleware checks against required role(s) per route.
- **Password security**: bcrypt hashing for email/password accounts.

---

## 6. Database Design Principles

- UUID primary keys throughout for security and distributed-system friendliness.
- Enum types used for constrained fields (roles, song status, reminder types, subscription plans) to enforce data integrity at the DB level.
- `updated_at` auto-maintained via triggers on all mutable tables.
- GIN indexes on `tags` (array) and full-text search on `songs.title` for fast filtering/search.
- Snapshot-based analytics tables (`analytics_snapshots`, `performance_metrics`) rather than mutating running totals, enabling historical trend charts.

---

## 7. AI Integration Architecture

- Centralized `openaiService.ts` encapsulates all prompt construction and OpenAI calls — controllers never call OpenAI directly.
- Every AI request is logged to `ai_coach_logs` with token usage and estimated cost, feeding the Owner Dashboard's "OpenAI Cost" metric.
- System prompt is fixed and domain-specific (music career coaching) to keep responses on-brand and relevant.
- Rate limiting on AI routes is tiered by subscription plan (free vs premium) to control cost.

---

## 8. Social Integration Architecture

- **YouTube**: Data API v3, read-only, keyed by API key (no per-user OAuth needed for public channel stats).
- **Instagram**: Graph API, requires the user's Business/Creator account connected via a long-lived access token; insights endpoints require page-level permissions.
- Both services expose calculated metrics (engagement rate, best posting time, upload frequency) computed server-side rather than trusting client-side math.

---

## 9. Notifications Architecture

- Firebase Cloud Messaging (FCM) for push notifications across Android, iOS, and Web.
- `notificationService.ts` builds notification payloads per reminder type and sends to individual devices, multiple devices, or topics.
- A scheduled job (node-cron) scans the `reminders` table for due reminders and triggers FCM sends, marking `is_sent = true` after dispatch.

---

## 10. Payments Architecture

- Razorpay handles order creation, checkout, and subscription billing.
- Payment verification uses HMAC signature validation server-side (`razorpay_signature`) before marking any payment as `captured`.
- Webhook endpoint independently verifies Razorpay webhook signatures to handle async events (renewals, failures, refunds) reliably even if the client-side flow is interrupted.

---

## 11. Owner/Admin Observability

- `api_usage_logs` tracks every external API call (service, cost, status code) for cost monitoring.
- `app_sessions` tracks session start/end, platform, and geography for DAU/MAU and retention calculations.
- `crash_reports` and `bug_reports` are ingested from client SDKs (mobile crash reporting, in-app bug report forms) and surfaced in the Owner Dashboard.

---

## 12. Scalability Considerations

- Stateless backend (JWT-based auth, no server-side sessions) allows horizontal scaling behind Railway/Render's load balancing.
- Supabase connection pooling (PgBouncer) prevents connection exhaustion under serverless/multi-instance backend deployments.
- Firebase Storage and CDN-backed public URLs offload media serving from the application server entirely.
- AI and social-integration calls are the primary latency/cost bottlenecks — designed as isolated service modules so they can be moved to background job queues (e.g., BullMQ + Redis) if synchronous latency becomes an issue at scale.
