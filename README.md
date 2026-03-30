# Iraq City-Center Business Data Pipeline

This project implements a **modular source-selector acquisition and verification system** for Iraq-focused, central-city business directory data.

## What is implemented

- Provider-based connector architecture (`searchBusinesses`, `enrichBusiness`, `validateRecord`, `mapToCanonicalSchema`).
- Configurable provider catalog for:
  - Geoapify, Foursquare, HERE, TomTom, OSM/Nominatim
  - SerpApi
  - Outscraper, Apify
  - CSV/XLSX/JSON uploads
- Source selector UI with:
  - select-all and per-provider checkboxes
  - priority mode dropdown
  - toggles for free-tier/map/enrichment/fallback/manual/central-city
  - city/category/subcategory/district controls
  - max results / duplicate tolerance / verification strictness controls
- Canonical schema with quality/verification/publish/duplicate/suburb scoring and audit metadata.
- Execution modes:
  - sequence or safe parallel
  - stop-on-threshold
  - fallback recommendation when primary quality is weak
  - free-tier-first, source-priority, best-coverage, cheapest-first
- Central-city allowlist enforcement per city.
- Validation + normalization + dedup + merge + confidence attribution logic.
- Import/export services and report generation:
  - import summary
  - rejected rows
  - duplicate report
  - incomplete report
  - export-ready report
  - provider performance report
- QC dashboard workflow statuses:
  - Pending Review, Needs Cleaning, Needs Verification, Verified, Rejected, Export Ready, Outside Central Coverage

## API routes

- `GET /api/providers` - Provider configs
- `POST /api/run` - Run acquisition/merge/validation pipeline
- `GET /api/businesses` - QC queue listing with filters
- `GET /api/export?format=json|csv` - Export latest records

## TODO: provider setup and API keys

1. Add real connector API calls in `src/server/connectors/` per provider.
2. Configure provider keys in env:
   - `GEOAPIFY_API_KEY`
   - `FOURSQUARE_API_KEY`
   - `HERE_API_KEY`
   - `TOMTOM_API_KEY`
   - `SERPAPI_API_KEY`
   - `OUTSCRAPER_API_KEY`
   - `APIFY_API_TOKEN`
   - `OPENCAGE_API_KEY` (free-tier-first geocoding helper)
3. Add request retry/backoff and per-provider quota safeguards.
4. Implement strict Nominatim low-volume policy guard for non-self-hosted usage.
5. Replace mock connector outputs with real responses and field-level source attribution.
6. Add persistent storage migration for canonical schema and audit history.

## Development

```bash
npm install
npm run dev
npm run lint
```
