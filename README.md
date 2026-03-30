# SKYHIGH — Supabase-backed Iraq Business Discovery

Run this SQL in your Supabase SQL Editor to set up the database.

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  local_name TEXT,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  governorate TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  confidence_score FLOAT DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_source ON businesses(source);
```

## Environment Variables

Create a `.env` file (or set in your runtime environment):

- `SUPABASE_URL` (required)
- `SUPABASE_SERVICE_ROLE_KEY` (required, server-only)
- `GEMINI_API_KEY` (optional, only needed when Gemini source is enabled)

> The frontend does **not** use Supabase service-role credentials. All reads/writes go through Express API endpoints.

## Setup

1. Create a Supabase project and run the SQL above.
2. Set environment variables.
3. Install dependencies:
   - `npm install`
4. Start the app:
   - `npm run dev`

## Live API Endpoints

- `POST /api/run` — trigger a discovery run (`{ city, category, sources: ['osm' | 'gemini'] }`)
- `GET /api/businesses` — paginated business listing with filters (`city`, `category`, `source`, `search`)
- `GET /api/dashboard-summary` — aggregate stats for admin dashboard
- `GET /api/health` — health check

## Source Support (Current)

- ✅ `osm` (real collector via OSM/Nominatim)
- ✅ `gemini` (LLM-assisted discovery; lower trust than structured sources)
- 🚫 Other source labels shown in UI are explicitly disabled until integrated.
