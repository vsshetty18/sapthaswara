# SvaraVerse AI - API Documentation

Base URL (development): `http://localhost:5000/api`
Base URL (production): `https://api.svaraverse.com/api`

All authenticated endpoints require a Bearer token in the `Authorization` header:

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Songs](#songs)
4. [Analytics](#analytics)
5. [AI Coach](#ai-coach)
6. [Planner](#planner)
7. [Reminders](#reminders)
8. [Community](#community)
9. [Payments](#payments)
10. [Owner](#owner)
11. [Error Format](#error-format)

---

## Authentication

### POST `/auth/signup`
Create a new user account.

**Body**
```json
{
  "fullName": "Ananya Rao",
  "email": "ananya.rao@example.com",
  "username": "ananya_sings",
  "password": "SecurePass123"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "username": "..." },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### POST `/auth/login`
Login with email/username + password.

**Body**
```json
{ "identifier": "ananya_sings", "password": "SecurePass123" }
```

### POST `/auth/google`
Login/signup via Google (Firebase ID token).

**Body**
```json
{ "idToken": "firebase_id_token" }
```

### POST `/auth/forgot-password`
**Body**: `{ "email": "user@example.com" }`

### POST `/auth/reset-password`
**Body**: `{ "token": "reset_token", "newPassword": "NewSecurePass123" }`

### POST `/auth/verify-email`
**Body**: `{ "token": "verification_token" }`

### POST `/auth/refresh-token`
**Body**: `{ "refreshToken": "jwt_refresh_token" }`

### POST `/auth/logout`
Requires auth. Invalidates refresh token.

---

## Users

### GET `/users/me`
Get current user profile. Requires auth.

### PATCH `/users/me`
Update profile fields (fullName, bio, avatarUrl, instagramHandle, youtubeChannelId, timezone, themePreference, languagePreference).

### GET `/users/:id`
Get public profile of another user.

### DELETE `/users/me`
Delete own account (soft delete).

### POST `/users/me/fcm-token`
Register a device FCM token for push notifications.
**Body**: `{ "fcmToken": "..." }`

---

## Songs

### GET `/songs`
List songs for current user. Supports query params: `status`, `mood`, `language`, `difficulty`, `search`, `tags`, `page`, `limit`, `sortBy`, `sortOrder`.

### POST `/songs`
Create/upload a new song (multipart/form-data for audio file + JSON metadata).

### GET `/songs/:id`
Get single song details.

### PATCH `/songs/:id`
Update song metadata or status.

### DELETE `/songs/:id`
Delete a song.

### POST `/songs/playlists`
Create a playlist. **Body**: `{ "name": "...", "description": "...", "songIds": ["uuid"] }`

### GET `/songs/playlists`
List user's playlists.

### PATCH `/songs/playlists/:id`
Update playlist (add/remove songs, rename).

### DELETE `/songs/playlists/:id`
Delete a playlist.

---

## Analytics

### GET `/analytics/dashboard`
Returns dashboard summary: streak, songs completed/remaining, followers, subscribers, views, hours practiced, uploads.

### GET `/analytics/instagram?handle=<handle>`
Fetch Instagram profile + engagement stats (requires connected/verified handle).

### GET `/analytics/youtube?channel=<handle>`
Fetch YouTube channel + video stats.

### GET `/analytics/report?period=weekly|monthly|yearly`
Get aggregated analytics report for the period.

### GET `/analytics/heatmap`
Get practice/activity heatmap data for the past year.

---

## AI Coach

All routes require auth and are rate-limited per subscription tier.

### POST `/ai/suggest-song`
Suggests which song to upload today based on the user's library.

### POST `/ai/suggest-practice`
Suggests today's practice focus.

### POST `/ai/trending-song`
**Body**: `{ "language": "Hindi" }` — returns trending song suggestions.

### POST `/ai/hashtags`
**Body**: `{ "songTitle": "...", "mood": "...", "language": "..." }`

### POST `/ai/upload-timing`
Returns best day/time to post based on the user's engagement history.

### POST `/ai/caption`
**Body**: `{ "songTitle": "...", "mood": "...", "tone": "..." }`

### POST `/ai/thumbnail-ideas`
**Body**: `{ "songTitle": "..." }`

### POST `/ai/cover-image-ideas`
**Body**: `{ "songTitle": "...", "mood": "..." }`

### POST `/ai/reel-ideas`
Suggests Reel concepts using the user's song library.

### POST `/ai/collaboration-suggestions`
### POST `/ai/live-session-suggestions`
### POST `/ai/audience-analysis`
### POST `/ai/performance-review`
### POST `/ai/motivation`
### POST `/ai/growth-prediction`
### POST `/ai/career-suggestions`
**Body**: `{ "goal": "become a successful playback singer" }`

---

## Planner

### GET `/planner/tasks?date=YYYY-MM-DD`
List tasks for a given day (defaults to today).

### POST `/planner/tasks`
Create a task. **Body**: `{ "title": "...", "category": "practice", "scheduledDate": "...", "notes": "..." }`

### PATCH `/planner/tasks/:id`
Update or mark task complete.

### DELETE `/planner/tasks/:id`

### GET `/planner/progress?date=YYYY-MM-DD`
Returns completion percentage for the day.

---

## Reminders

### GET `/reminders`
List active reminders for user.

### POST `/reminders`
Create a reminder. **Body**: `{ "type": "practice", "title": "...", "scheduledTime": "ISO8601", "isRecurring": true, "recurrencePattern": "daily" }`

### PATCH `/reminders/:id`
### DELETE `/reminders/:id`

---

## Community

### GET `/community/creators?search=&specialization=&location=`
Discover creators, teachers, music directors, studios.

### POST `/community/connections`
Send a connection request. **Body**: `{ "recipientId": "uuid" }`

### PATCH `/community/connections/:id`
Accept/reject a connection request.

### GET `/community/messages/:userId`
Get message thread with a user.

### POST `/community/messages`
**Body**: `{ "recipientId": "uuid", "content": "..." }`

### GET `/community/groups`
### POST `/community/groups`
### POST `/community/groups/:id/join`

### POST `/community/songs/:songId/like`
### POST `/community/songs/:songId/comment`

---

## Payments

### POST `/payments/create-order`
Creates a Razorpay order for a subscription plan.
**Body**: `{ "plan": "premium_monthly" }`

### POST `/payments/verify`
Verifies payment signature after checkout completes.
**Body**: `{ "razorpayOrderId": "...", "razorpayPaymentId": "...", "razorpaySignature": "..." }`

### POST `/payments/webhook`
Razorpay webhook endpoint (signature-verified, no auth header).

### GET `/payments/subscription`
Get current user's subscription status.

### POST `/payments/cancel`
Cancel subscription at period end.

---

## Owner

All routes require `owner` role.

### GET `/owner/overview`
Total users, DAU, MAU, premium users, revenue, downloads.

### GET `/owner/users?page=&limit=&role=`
### GET `/owner/revenue?period=`
### GET `/owner/support-tickets`
### GET `/owner/bug-reports`
### GET `/owner/crash-reports`
### GET `/owner/reviews`
### GET `/owner/system-health`
Storage usage, AI usage/cost, database status, server status.

---

## Error Format

All errors follow this shape:

```json
{
  "success": false,
  "message": "Human readable error message",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

Common HTTP status codes: `400` validation error, `401` unauthorized, `403` forbidden (role), `404` not found, `429` rate limited, `500` server error.
