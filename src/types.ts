export type ProviderType = 'poi' | 'search_fallback' | 'scraping_enrichment' | 'manual_upload';

export type ProviderId =
  | 'geoapify'
  | 'foursquare'
  | 'here'
  | 'tomtom'
  | 'osm_nominatim'
  | 'serpapi'
  | 'outscraper'
  | 'apify'
  | 'csv_upload'
  | 'xlsx_upload'
  | 'json_upload'
  | 'opencage';

export type SourcePriorityMode =
  | 'source-priority'
  | 'best-coverage'
  | 'cheapest-first'
  | 'free-tier-first';

export type CoverageType = 'central' | 'outside_central' | 'unknown';

export type QCStatus =
  | 'Pending Review'
  | 'Needs Cleaning'
  | 'Needs Verification'
  | 'Verified'
  | 'Rejected'
  | 'Export Ready'
  | 'Outside Central Coverage';

export interface ProviderConfig {
  provider_id: ProviderId;
  provider_name: string;
  provider_type: ProviderType;
  is_enabled: boolean;
  priority: number;
  supports_phone: boolean;
  supports_social: boolean;
  supports_address: boolean;
  supports_coordinates: boolean;
  supports_hours: boolean;
  supports_images: boolean;
  supports_bulk: boolean;
  supports_free_tier: boolean;
  cost_notes: string;
  rate_limit_notes: string;
}

export interface CanonicalBusiness {
  id?: string;
  business_name: string;
  normalized_business_name: string;
  category: string;
  subcategory?: string;
  city: string;
  district?: string;
  city_center_zone?: string;
  coverage_type: CoverageType;
  address_text?: string;
  address_normalized?: string;
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  phone_primary?: string;
  phone_secondary?: string;
  whatsapp_number?: string;
  website_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  telegram_url?: string;
  email?: string;
  description?: string;
  opening_hours?: string;
  image_url?: string;
  logo_url?: string;
  provider_id: ProviderId;
  source_name: string;
  source_url?: string;
  source_type: ProviderType;
  completeness_score: number;
  verification_score: number;
  publish_readiness_score: number;
  duplicate_risk_score: number;
  suburb_risk_score: number;
  status: QCStatus;
  verification_notes?: string[];
  field_confidence?: Record<string, number>;
  field_attribution?: Record<string, ProviderId[]>;
  evidence_sources?: ProviderId[];
  created_at: string;
  updated_at: string;
}

export interface SourceSelector {
  selectAllSources: boolean;
  selectedProviders: ProviderId[];
  sourcePriorityMode: SourcePriorityMode;
  freeTierOnly: boolean;
  mapPoiOnly: boolean;
  enrichmentOnly: boolean;
  fallbackSearchOnly: boolean;
  manualUploadsOnly: boolean;
  centralCityOnly: boolean;
  city: string;
  category: string;
  subcategory?: string;
  districtCentralZone?: string;
  maxResultsPerSource: number;
  duplicateTolerance: number;
  verificationStrictness: number;
}

export interface DiscoveryRequest {
  selector: SourceSelector;
  stopOnThreshold?: number;
  runInParallel?: boolean;
  files?: UploadFile[];
}

export interface UploadFile {
  fileName: string;
  content: string;
}

export interface DiscoveryResult {
  summary: string;
  insertedCount: number;
  skippedCount: number;
  errors: string[];
  records: CanonicalBusiness[];
  reports: ImportExportReports;
  providerPerformance: ProviderPerformance[];
}

export interface ProviderPerformance {
  provider_id: ProviderId;
  fetched: number;
  accepted: number;
  rejected: number;
}

export interface ImportExportReports {
  importSummary: string;
  rejectedRowsReport: string[];
  duplicateReport: string[];
  incompleteReport: string[];
  exportReadyReport: string[];
  providerPerformanceReport: string[];
}
