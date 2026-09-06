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
