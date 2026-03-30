import { ProviderConfig, ProviderId } from '../../types';

export const providerCatalog: ProviderConfig[] = [
  {
    provider_id: 'geoapify',
    provider_name: 'Geoapify',
    provider_type: 'poi',
    is_enabled: true,
    priority: 1,
    supports_phone: true,
    supports_social: false,
    supports_address: true,
    supports_coordinates: true,
    supports_hours: true,
    supports_images: false,
    supports_bulk: true,
    supports_free_tier: true,
    cost_notes: 'Free tier available, paid beyond quota.',
    rate_limit_notes: 'Rate-limited per API key plan.'
  },
  {
    provider_id: 'foursquare', provider_name: 'Foursquare Places', provider_type: 'poi', is_enabled: true, priority: 6,
    supports_phone: true, supports_social: false, supports_address: true, supports_coordinates: true, supports_hours: true,
    supports_images: true, supports_bulk: false, supports_free_tier: true, cost_notes: 'Test/free tier if configured.', rate_limit_notes: 'Plan-based request limits.'
  },
  {
    provider_id: 'here', provider_name: 'HERE Search/Discover', provider_type: 'poi', is_enabled: true, priority: 7,
    supports_phone: true, supports_social: false, supports_address: true, supports_coordinates: true, supports_hours: false,
    supports_images: false, supports_bulk: true, supports_free_tier: false, cost_notes: 'Usage-based.', rate_limit_notes: 'Per-project throttling.'
  },
  {
    provider_id: 'tomtom', provider_name: 'TomTom Search/POI', provider_type: 'poi', is_enabled: true, priority: 8,
    supports_phone: true, supports_social: false, supports_address: true, supports_coordinates: true, supports_hours: false,
    supports_images: false, supports_bulk: true, supports_free_tier: false, cost_notes: 'Usage-based.', rate_limit_notes: 'Plan-based QPS limits.'
  },
  {
    provider_id: 'osm_nominatim', provider_name: 'OSM/Nominatim', provider_type: 'poi', is_enabled: false, priority: 9,
    supports_phone: false, supports_social: false, supports_address: true, supports_coordinates: true, supports_hours: false,
    supports_images: false, supports_bulk: false, supports_free_tier: true, cost_notes: 'Public endpoint free but restricted.', rate_limit_notes: 'Low-volume only; no heavy bulk jobs.'
  },
  {
    provider_id: 'serpapi', provider_name: 'SerpApi', provider_type: 'search_fallback', is_enabled: true, priority: 3,
    supports_phone: true, supports_social: true, supports_address: true, supports_coordinates: false, supports_hours: false,
    supports_images: false, supports_bulk: true, supports_free_tier: true, cost_notes: 'Paid with limited trial credits.', rate_limit_notes: 'Credit and rate limits per account.'
  },
  {
    provider_id: 'outscraper', provider_name: 'Outscraper', provider_type: 'scraping_enrichment', is_enabled: true, priority: 4,
    supports_phone: true, supports_social: true, supports_address: true, supports_coordinates: true, supports_hours: true,
    supports_images: true, supports_bulk: true, supports_free_tier: true, cost_notes: 'Free quota then paid.', rate_limit_notes: 'Queue and quota limits.'
  },
  {
    provider_id: 'apify', provider_name: 'Apify', provider_type: 'scraping_enrichment', is_enabled: true, priority: 5,
    supports_phone: true, supports_social: true, supports_address: true, supports_coordinates: true, supports_hours: true,
    supports_images: true, supports_bulk: true, supports_free_tier: true, cost_notes: 'Free usage with paid overages.', rate_limit_notes: 'Actor and platform limits.'
  },
  {
    provider_id: 'csv_upload', provider_name: 'CSV Upload', provider_type: 'manual_upload', is_enabled: true, priority: 10,
    supports_phone: true, supports_social: true, supports_address: true, supports_coordinates: true, supports_hours: true,
    supports_images: true, supports_bulk: true, supports_free_tier: true, cost_notes: 'Local upload.', rate_limit_notes: 'Bounded by server memory/file size.'
  },
  {
    provider_id: 'xlsx_upload', provider_name: 'XLSX Upload', provider_type: 'manual_upload', is_enabled: true, priority: 11,
    supports_phone: true, supports_social: true, supports_address: true, supports_coordinates: true, supports_hours: true,
    supports_images: true, supports_bulk: true, supports_free_tier: true, cost_notes: 'Local upload.', rate_limit_notes: 'Bounded by parser/file size.'
  },
  {
    provider_id: 'json_upload', provider_name: 'JSON Upload', provider_type: 'manual_upload', is_enabled: true, priority: 12,
    supports_phone: true, supports_social: true, supports_address: true, supports_coordinates: true, supports_hours: true,
    supports_images: true, supports_bulk: true, supports_free_tier: true, cost_notes: 'Local upload.', rate_limit_notes: 'Bounded by server memory/file size.'
  },
  {
    provider_id: 'opencage', provider_name: 'OpenCage', provider_type: 'search_fallback', is_enabled: true, priority: 2,
    supports_phone: false, supports_social: false, supports_address: true, supports_coordinates: true, supports_hours: false,
    supports_images: false, supports_bulk: true, supports_free_tier: true, cost_notes: 'Free tier available.', rate_limit_notes: 'Daily quota and QPS apply.'
  }
];

export function getProviderConfig(providerId: ProviderId): ProviderConfig {
  const config = providerCatalog.find((provider) => provider.provider_id === providerId);
  if (!config) {
    throw new Error(`Provider ${providerId} is not registered`);
  }
  return config;
}
