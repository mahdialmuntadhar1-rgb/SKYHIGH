export type BusinessStatus = 
  | 'pending_review' 
  | 'needs_cleaning' 
  | 'needs_verification' 
  | 'verified' 
  | 'rejected' 
  | 'export_ready'
  | 'outside_central_coverage';

export type SourceType = 'api' | 'scraper' | 'file';

export interface Source {
  id: DiscoverySource;
  name: string;
  type: SourceType;
  freeTier: boolean;
  bulkSupport: boolean;
  socialSupport: boolean;
  priority: number;
  enabled: boolean;
  reasonDisabled?: string;
}

export interface Business {
  id: string;
  name: string;
  local_name?: string | null;
  city: string;
  district?: string | null;
  city_center_zone?: string | null;
  category: string;
  subcategory?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  } | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: BusinessStatus | null;
  created_at?: string;
  updated_at?: string;
  qc_notes?: string | null;
  publish_readiness_score?: number | null;
  source?: string | null;
  source_url?: string | null;
  confidence_score?: number | null;
  coverage_type?: string | null;
  raw_data?: unknown;
}

export interface CityConfig {
  name: string;
  districts: {
    name: string;
    central_zones: string[];
  }[];
}

export interface AdminCityConfig {
  city: string;
  approved_central_districts: string[];
  approved_central_zones: string[];
}

export type DiscoverySource = 'gemini' | 'osm_nominatim';

export interface DiscoveryResult {
  summary: string;
  insertedCount: number;
  skippedCount: number;
  errors: string[];
}

export interface DiscoveryRequest {
  city: string;
  category: string;
  sources: DiscoverySource[];
}

export interface DashboardStats {
  totalBusinesses: number;
  countsByCity: Array<{ city: string; count: number }>;
  countsBySource: Array<{ source: string; count: number }>;
  recentBusinesses: Business[];
}
