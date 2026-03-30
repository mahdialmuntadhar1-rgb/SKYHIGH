# SKYHIGH — Supabase-backed Iraq Business Discovery

This app runs end-to-end collection from UI → backend → Supabase and provides live admin views.

## Database schema

Run this SQL in Supabase SQL Editor (or apply `supabase/migrations/20260330_businesses_core.sql`):

```sql
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  local_name TEXT,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  confidence_score DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_source ON businesses(source);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);
```

## Required environment variables

Create a `.env` file with:

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
GEMINI_API_KEY=YOUR_GEMINI_KEY   # optional: required only for Gemini source
```

> `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to browser code.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables above.
3. Start development server:
   ```bash
   npm run dev
   ```

## API endpoints

- `POST /api/run` body:
  ```json
  {
    "city": "Baghdad",
    "category": "Food & Beverage",
    "sources": ["osm_nominatim", "gemini"]
  }
  ```
- `GET /api/businesses` with optional query params: `city`, `category`, `source`, `q`, `page`, `pageSize`
- `GET /api/dashboard-stats` for live dashboard aggregates
