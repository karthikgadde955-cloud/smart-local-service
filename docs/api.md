# REST API Reference — Smart Local Service

## Authentication Endpoints
- `POST /auth/register` — Register a customer or service provider.
- `POST /auth/login` — Authenticate and receive JWT access & refresh tokens.
- `POST /auth/refresh` — Refresh access token.
- `POST /auth/logout` — Revoke session.

## User & Profile Endpoints
- `GET /users/me` — Fetch authenticated user profile.
- `PUT /users/me` — Update profile & location coordinates.

## Service Category & Provider Endpoints
- `GET /services` — List all service categories.
- `GET /providers` — List all service providers.
- `GET /providers/nearby?lat={lat}&lon={lon}&radius={km}` — Find nearby providers within radius.
- `GET /providers/recommended?lat={lat}&lon={lon}&mode={mode}` — Get AI Smart Ranked provider recommendations with transparent score breakdown.
- `GET /providers/ranked?sortBy={best_match|distance|price|rating|availability}` — Custom sorted providers.
- `GET /providers/:id` — Detailed provider profile with ratings & reviews.

## AI Damage Analysis
- `POST /ai/analyze` — Submit photo/video/text description for AI problem diagnosis.
- `GET /ai/analysis/:id` — Retrieve stored AI analysis result.

## Appliance & Preventive Maintenance
- `GET /appliances` — List customer's appliances.
- `POST /appliances` — Add new appliance & generate maintenance reminder.
- `PUT /appliances/:id` — Update appliance details.
- `DELETE /appliances/:id` — Remove appliance.

## AI Emergency Rescue
- `POST /emergency` — Request vehicle breakdown assistance with live GPS & automatic search radius expansion (5km -> 10km -> 20km).
- `GET /emergency/:id` — Retrieve emergency request & dispatched mechanic status.

## Bookings & Reviews
- `POST /bookings` — Create a service booking.
- `GET /bookings` — View customer/provider booking history.
- `PATCH /bookings/:id/status` — Update booking status (`ACCEPTED`, `ON_THE_WAY`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- `POST /reviews` — Submit 1–5 star review and recalculate provider average rating.

## Production Deployment Notes (Vercel)
- All REST API endpoints listed above are accessible under the same path structure when deployed to Vercel (e.g. `https://your-domain.vercel.app/auth/login`, `https://your-domain.vercel.app/api/health`).
- Health check available at `GET /api/health`.

