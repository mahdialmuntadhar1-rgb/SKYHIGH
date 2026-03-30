export type BusinessStatus =
  | 'pending_review'
  | 'needs_cleaning'
  | 'needs_verification'
  | 'verified'
  | 'rejected'
  | 'export_ready'
  | 'outside_central_coverage';

export type SourceType = 'api' | 'scraper' | 'file';

export type DiscoverySource = 'gemini' | 'osm';

export interface Source {
  id: DiscoverySource | string;
  name: string;
  type: SourceType;
  freeTier: boolean;
  bulkSupport: boolean;
  socialSupport: boolean;
  priority: number;
  enabled: boolean;
  description?: string;
}

export interface Business {
  id: string;
  name: string;
  local_name?: string;
  category: string;
  city: string;
  governorate?: string;
  district?: string;
  city_center_zone?: string;
  subcategory?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  facebook_url?: string;
  instagram_url?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
  latitude?: number;
  longitude?: number;
  source?: string;
  source_url?: string;
  confidence_score?: number;
  status?: BusinessStatus;
  completeness_score?: number;
  verification_score?: number;
  duplicate_risk?: number;
  suburb_risk?: number;
  publish_readiness_score?: number;
  coverage_type?: string;
  raw_data?: any;
  created_at: string;
  updated_at?: string;
  qc_notes?: string;
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
