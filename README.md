# Smart Local Service

> **TAGLINE:** "AI-powered repair, maintenance and emergency assistance for everyday needs."

Smart Local Service is an AI-powered local service platform primarily focused on **Home Appliance Repair**, **Preventive Maintenance**, and **AI Emergency Rescue for Vehicle Breakdowns**.

---

## 🌟 Key System Features

1. **Module 1 — Smart Repair**:
   - Upload Photo/Video/Text description of broken home appliance.
   - AI Damage Detection identifies appliance type, problem, severity, confidence, estimated cost range, and required professional.
   - Smart Provider Matching filters qualified service technicians.
   - Multi-Factor **Smart Ranking Engine** (Skill 30%, Distance 20%, Rating 15%, Availability 15%, Price 10%, Experience 10%).

2. **Module 2 — Preventive Maintenance**:
   - Appliance Inventory Management (Brand, Model, Purchase Date, Installation Date, Warranty Notes).
   - Maintenance Reminder Engine with automated interval scheduling.
   - Smart Ranking Engine customized for Preventive Maintenance (prioritizes specific appliance expertise).

3. **Module 3 — AI Emergency Rescue**:
   - Roadside vehicle breakdown rescue for Motorcycles, Scooters, Cars, and Other vehicles.
   - Live location sharing via GPS coordinates with Haversine distance & ETA calculation.
   - AI Emergency Ranking (Availability 25%, Distance 25%, ETA 20%, Skill 15%, Rating 10%, Price 5%).
   - **Emergency Search Expansion**: Automatically expands search radius (0-5km -> 5-10km -> 10-20km) when no nearby mechanics are found.
   - Immediate safety disclaimer for serious road accidents.

---

## 🛠️ Project Structure

```
smart-local-service/
├── backend/                  # Node.js + Express + TypeScript + Prisma ORM
│   ├── src/
│   │   ├── ai/               # AIService abstraction & MockAIService implementation
│   │   ├── matching/         # Centralized SmartRankingService
│   │   ├── controllers/      # Route controllers (Auth, Provider, AI, Emergency, Appliance, Booking)
│   │   ├── middleware/       # Auth JWT, Role Guards, Request Validation & Central Error Handler
│   │   └── tests/            # Automated unit & end-to-end integration tests
│   ├── prisma/               # Schema with 21 data models & rich seed script
│   ├── package.json
│   └── .env.example
├── frontend/                 # Flutter mobile app codebase (Material 3)
│   ├── lib/                  # Complete Dart features, screens, models, services, repositories
│   └── pubspec.yaml
├── web_app/                  # Interactive Web UI for instant visual testing & live API connectivity
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── docs/                     # Comprehensive technical documentation
    ├── architecture.md
    ├── api.md
    └── ranking-engine.md
```

---

## 🚀 Quick Start Instructions

### 1. Backend Setup & Startup
Node.js v20+ is required.

```bash
cd backend

# Install dependencies
npm install

# Push database schema to SQLite/PostgreSQL
npx prisma db push

# Seed development database with sample providers, appliances & reviews
npm run db:seed

# Run automated tests
npm test

# Start Backend Express Server
npm run dev
```
The server will start on **http://localhost:5000**.

### 2. Interactive Web Application
Open your browser and navigate to:
```
http://localhost:5000
```
This serves the interactive full-stack Web Application where you can test AI damage detection, Smart Provider Ranking, Preventive Maintenance scheduling, and AI Emergency Rescue in real time!

---

## 🧪 Automated Tests

Run the test suite:
```bash
cd backend
npm test
```

### Verified Test Scenarios:
- ✅ **Test 1**: Qualified expert outranks closer/cheaper unqualified worker in Smart Repair mode.
- ✅ **Test 2**: Fast ETA emergency mechanic ranks #1 in AI Emergency Rescue mode.
- ✅ **Test 3**: All provider scores are strictly normalized within [0, 100].
- ✅ **Test 4**: #1 ranked provider is automatically marked `isBestMatch = true`.
- ✅ **Test 5**: End-to-end JWT auth, service category listing, AI analysis creation, emergency search expansion, and appliance inventory API workflows.
