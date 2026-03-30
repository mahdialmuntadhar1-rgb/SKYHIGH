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
  id: string;
  name: string;
  type: SourceType;
  freeTier: boolean;
  bulkSupport: boolean;
  socialSupport: boolean;
  priority: number;
  enabled: boolean;
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
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  facebook_url?: string;
  instagram_url?: string;
  source: string;
  source_url?: string;
  confidence_score?: number;
  status?: BusinessStatus;
  completeness_score?: number;
  verification_score?: number;
  publish_readiness_score?: number;
  coverage_type?: string;
  created_at: string;
  updated_at?: string;
  raw_data?: any;
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
