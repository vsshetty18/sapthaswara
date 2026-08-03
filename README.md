# 🎵 SvaraVerse AI

**A Premium AI-Powered Operating System for Indian Music Creators**

SvaraVerse AI is not a music streaming app — it's a complete career management platform for singers, playback singer aspirants, music creators, YouTubers, and Instagram creators. It combines song libraries, daily planning, social analytics, and an AI Music Coach into one luxurious, Apple-like experience.

---

## ✨ Features

- 🔐 **Full Authentication** — Email/Password, Google Login, Role-Based Access (User, Creator, Premium, Admin, Owner)
- 📊 **Creator Dashboard** — Streaks, practice progress, growth graphs, AI suggestions
- 🎶 **Song Library** — Upload, tag, filter, and organize songs with lyrics, scale, mood, and status
- 📈 **Instagram & YouTube Integration** — Real engagement analytics, best posting times, top content
- 🤖 **AI Music Coach** — Powered by OpenAI: song suggestions, hashtags, captions, career roadmaps, and more
- 🗓️ **Daily Planner & Reminders** — Practice, recording, posting, and networking tasks with push notifications
- 🏆 **Milestones & Achievements** — Confetti, badges, and celebration animations
- 🖼️ **AI Poster Generator** — Instagram posts, thumbnails, album covers, festival posters
- 👥 **Community** — Connect with creators, teachers, music directors, playback singers, and studios
- 💳 **Premium Subscriptions** — Razorpay-powered billing with unlimited AI, posters, and advanced analytics
- 🛠️ **Owner Dashboard** — Full platform observability: users, revenue, system health, API costs

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Web Frontend | Next.js, React, Tailwind CSS |
| Mobile | React Native |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Supabase) |
| Auth | Firebase Authentication + JWT |
| Storage | Firebase Storage |
| AI | OpenAI API |
| Charts | Recharts |
| Notifications | Firebase Cloud Messaging |
| Payments | Razorpay |
| Deployment | Vercel (frontend), Railway/Render (backend), Supabase (DB) |

---

## 📁 Project Structure
svaraverse/
├── frontend/ # Next.js web app
├── backend/ # Node.js + Express API
├── database/ # PostgreSQL schema, migrations, seed data
├── docs/ # API, setup, deployment, architecture docs
├── docker-compose.yml
└── README.md

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for full system design.

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/your-org/svaraverse.git
cd svaraverse

# Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Frontend (in a new terminal)
cd frontend && npm install && cp .env.local.example .env.local && npm run dev
```

Full setup instructions (Firebase, Supabase, OpenAI, Razorpay, YouTube, Instagram) are in [`docs/SETUP.md`](docs/SETUP.md).

---

## 📖 Documentation

- [API Reference](docs/API.md)
- [Setup Guide](docs/SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture Overview](docs/ARCHITECTURE.md)

---

## 🎨 Design Philosophy

Inspired by Veena strings, Tanpura drones, Tabla patterns, and temple architecture — rendered through a modern, minimal lens: beige, sand, cream, warm brown, coffee, dark walnut, and gold accents, with glassmorphism, soft shadows, and smooth premium animations throughout.

---

## 📄 License

Proprietary — All rights reserved.
