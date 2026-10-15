# Timely — Substitute Teacher Scheduling

> Fair, automated substitution plans for school administrators. Generated in minutes, not hours.

## What it does

When a teacher is absent, school admins manually piece together a substitute plan every morning — slow, error-prone, and often unfair. Timely automates this entirely.

**Log absences → Get a fair plan → Print and walk away.**

The algorithm assigns substitutes using a 4-level priority system:
1. Same subject match first
2. Eligible category (PGT covers TGT/PRT, TGT covers PRT)
3. Lightest substitution load today (fairness)
4. Alphabetical tiebreaker

No teacher gets overloaded. No favoritism. Every decision is transparent.

## Features

- **Absence Logger** — Mark which teachers are absent, per period
- **Substitution Generator** — Instant fair plan, conflict-free
- **Roster & Timetable** — Manage your teacher list and weekly schedule
- **Manual Override** — Reassign any substitute with one click
- **Public Schedule Board** — Shareable link for students and staff (Pro)
- **Schedule History** — View and download past substitution logs (Pro)
- **Student Portal** — Students check their day's schedule without needing accounts

## Tech Stack

- **Frontend** — React + TypeScript, TanStack Router, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend** — Supabase (Postgres + Auth)
- **Deployment** — Vercel
- **Package Manager** — Bun

## Live Demo

[timelysub.vercel.app](https://timelysub.vercel.app)

## Getting Started

```bash
git clone https://github.com/copious0420/substitution-ally
cd substitution-ally
bun install
bun run dev
```

## Team

**Team Aeronics**  
