# Achieve — Nurse Match

A Next.js application for the Achieve Nurse Match program. Nurses can apply for sponsored clinical research training, track their application status, and manage their profiles.

## Routes

| Path | Description |
|---|---|
| `/nurse-match` | Root — renders landing page |
| `/nurse-match/landing` | Landing page |
| `/nurse-match/apply` | Application form |
| `/nurse-match/status` | Application status check |
| `/nurse-match/edit` | Edit submitted application |
| `/nurse-match/admin` | Admin dashboard (nurse list, map, status management) |
| `/nurse-match/dev/*` | Dev/test pages |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Map**: Mapbox GL / react-map-gl
- **Email**: AWS SES
- **Auth**: Demo password gate (cookie-based), admin login TBD

## Environment Variables

Create a `.env.local` file with the following:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=

# AWS SES
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SES_FROM_EMAIL=

# Demo auth
NURSE_MATCH_PASSWORD=
MASTER_DEMO_PASSWORD=
```

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000/nurse-match

## Database

Run `supabase-nurse-applications.sql` in your Supabase SQL editor to create the `nurse_applications` table and indexes.
