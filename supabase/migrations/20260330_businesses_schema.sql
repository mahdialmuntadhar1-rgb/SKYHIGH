-- SKYHIGH businesses core schema
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

CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_source ON businesses(source);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_phone ON businesses(phone);
