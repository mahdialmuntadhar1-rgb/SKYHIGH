# SKYHIGH — Supabase-backed Business Discovery

This project runs business collection through an Express backend and stores records in Supabase.

## 1) Database setup (Supabase)

Run the migration in `supabase/migrations/20260330_businesses_schema.sql`.

If you prefer manual SQL, use this core table:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  local_name TEXT,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  governorate TEXT,
  district TEXT,
  city_center_zone TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  source TEXT NOT NULL,
  source_url TEXT,
  confidence_score DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 2) Environment variables

Set these in your server runtime environment:

- `SUPABASE_URL` (required)
- `SUPABASE_SERVICE_ROLE_KEY` (required, server-only)
- `GEMINI_API_KEY` (optional, only needed if Gemini source is enabled)

> Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## 3) Install and run

```bash
npm install
npm run dev
```

Server runs on `http://localhost:3000` and serves both API + frontend in dev mode.

## 4) Real collection flow

- UI `Start Collection` sends `POST /api/run`
- Backend validates payload and runs selected collectors (`osm`, `gemini`)
- New records are deduplicated and inserted into Supabase
- Admin Dashboard and Review Queue load live records from backend APIs

## 5) API endpoints

- `GET /api/health`
- `GET /api/sources`
- `POST /api/run`
- `GET /api/businesses`
- `GET /api/dashboard`
