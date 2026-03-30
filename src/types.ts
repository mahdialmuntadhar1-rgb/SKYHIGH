export interface Business {
  id?: string;
  name: string;
  local_name?: string;
  category: string;
  city: string;
  governorate?: string;
  address?: string;
  phone?: string;
  website?: string;
  facebook_url?: string;
  instagram_url?: string;
  source: string;
  source_url?: string;
  confidence_score: number;
  created_at?: string;
}

export type DiscoverySource = 'gemini' | 'facebook' | 'instagram' | 'web_directory';

export interface DiscoveryRequest {
  city: string;
  category: string;
  sources: DiscoverySource[];
}

export interface DiscoveryResult {
  summary: string;
  insertedCount: number;
  skippedCount: number;
  errors: string[];
}
