# System Architecture — Smart Local Service

## Overview
Smart Local Service is an AI-powered local service platform primarily focused on home appliance repair, preventive maintenance, and AI emergency rescue for vehicle breakdowns.

```
+-----------------------------------------------------------------------+
|                           CLIENT LAYER                                |
|  +-----------------------------------+ +---------------------------+  |
|  | Flutter Mobile App (Material 3)   | | Web Application (HTML/JS) |  |
|  +-----------------+-----------------+ +-------------+-------------+  |
+--------------------|---------------------------------|----------------+
                     |                                 |
                     +----------------+----------------+
                                      | REST APIs (JSON / JWT Auth)
                                      v
+-----------------------------------------------------------------------+
|                           BACKEND LAYER                               |
|  +-----------------------------------------------------------------+  |
|  | Express Router (Auth, Providers, Services, AI, Emergency)       |  |
|  +---------------------------------+-------------------------------+  |
|                                    |                                  |
|  +---------------------------------v-------------------------------+  |
|  | Smart Ranking Engine (Smart Repair, Maintenance, Emergency)     |  |
|  +---------------------------------+-------------------------------+  |
|                                    |                                  |
|  +---------------------------------v-------------------------------+  |
|  | AIService Abstraction (Gemini Vision AI / Mock Fallback)        |  |
|  +---------------------------------+-------------------------------+  |
+------------------------------------|----------------------------------+
                                     | Prisma ORM
                                     v
+-----------------------------------------------------------------------+
|                           DATA LAYER                                  |
|  SQLite / PostgreSQL Database (Users, Profiles, Bookings, Appliances) |
+-----------------------------------------------------------------------+
```

## System Modules
1. **Module 1 — Smart Repair**: Photo/video damage detection, AI problem diagnosis, qualified worker filtering, multi-factor smart ranking.
2. **Module 2 — Preventive Maintenance**: Appliance inventory tracking, automated service reminders, ranking prioritized by appliance expertise.
3. **Module 3 — AI Emergency Rescue**: Vehicle breakdown rescue, live GPS coordinates, ETA priority ranking, search expansion (0-5km -> 5-10km -> 10-20km).

## Production Deployment Architecture (Vercel + PostgreSQL)

### 1. Database Layer (PostgreSQL)
- **Database Provider**: Managed PostgreSQL (Prisma Postgres / Supabase / Neon / Vercel Postgres).
- **Prisma Client**: Configured with `provider = "postgresql"` and global singleton pattern in `backend/src/database/client.ts` to reuse connection pools across serverless function warm starts.
- **Connection String**: Standard `postgresql://` or `postgres://` URL format with SSL enabled (`sslmode=require`).

### 2. Serverless Backend (Vercel)
- **Hosting Platform**: Vercel Serverless Functions (`@vercel/node`).
- **Root Directory**: `backend/`
- **Function Entry Point**: `backend/api/index.ts` wrapping Express application export.
- **Routing**: `backend/vercel.json` rewrites all incoming routes (`/(.*)`) to the serverless function handler.
- **Server Listener**: `server.ts` conditions `app.listen()` to local dev mode (`process.env.VERCEL !== '1'`).

### 3. Media Storage Limitation & Notice
- Serverless environments feature ephemeral, read-only filesystems (except `/tmp`).
- Local disk storage `./uploads` is supported for dev. Production media storage requires cloud object storage (e.g. Vercel Blob, AWS S3, or Cloudinary).

### 4. Required Production Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (`postgresql://user:password@host:5432/dbname?sslmode=require`)
- `PORT`: (Default `5000` locally, set automatically by host in production)
- `NODE_ENV`: `production`
- `JWT_SECRET`: Secure JWT signing secret
- `JWT_REFRESH_SECRET`: Secure refresh token secret
- `AI_PROVIDER`: `gemini` or `mock`
- `GEMINI_API_KEY`: Google Gemini API key

