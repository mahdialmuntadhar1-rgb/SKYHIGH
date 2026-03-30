import { CanonicalBusiness, ProviderConfig, SourceSelector } from '../../types';
import { SourceConnector } from './base';
import { applyNormalization } from '../pipeline/normalization';
import { validateRecord } from '../pipeline/validation';

export class MockConnector implements SourceConnector {
  constructor(public provider: ProviderConfig) {}

  async searchBusinesses(input: SourceSelector): Promise<CanonicalBusiness[]> {
    const now = new Date().toISOString();
    const count = Math.max(1, Math.min(input.maxResultsPerSource, 3));
    const rows = Array.from({ length: count }, (_, index) => ({
      business_name: `${input.category} ${this.provider.provider_name} ${index + 1}`,
      category: input.category,
      subcategory: input.subcategory,
      city: input.city,
      district: input.districtCentralZone || 'Karrada',
      city_center_zone: input.districtCentralZone || 'Karrada',
      address_text: `Center Block ${index + 1}, ${input.city}`,
      phone_primary: `07${index}12345678`,
      website_url: `https://${this.provider.provider_id}.example.com/${index + 1}`,
      source_url: `https://${this.provider.provider_id}.example.com/search`,
      description: `Generated sample from ${this.provider.provider_name}`
    }));

    return rows.map((row) => this.mapToCanonicalSchema(row, input));
  }

  async enrichBusiness(record: CanonicalBusiness): Promise<CanonicalBusiness> {
    return {
      ...record,
      opening_hours: record.opening_hours || '09:00-21:00',
      image_url: record.image_url || `https://${this.provider.provider_id}.example.com/image.jpg`,
      updated_at: new Date().toISOString()
    };
  }

  async validateRecord(record: CanonicalBusiness): Promise<CanonicalBusiness> {
    return validateRecord(applyNormalization(record), 0.75);
  }

  mapToCanonicalSchema(record: Record<string, any>, input: SourceSelector): CanonicalBusiness {
    const now = new Date().toISOString();
    return {
      business_name: record.business_name,
      normalized_business_name: record.business_name.toLowerCase(),
      category: input.category,
      subcategory: input.subcategory,
      city: input.city,
      district: record.district,
      city_center_zone: record.city_center_zone,
      coverage_type: 'unknown',
      address_text: record.address_text,
      address_normalized: record.address_text,
      google_maps_url: record.google_maps_url,
      latitude: record.latitude,
      longitude: record.longitude,
      phone_primary: record.phone_primary,
      phone_secondary: record.phone_secondary,
      whatsapp_number: record.whatsapp_number,
      website_url: record.website_url,
      facebook_url: record.facebook_url,
      instagram_url: record.instagram_url,
      tiktok_url: record.tiktok_url,
      telegram_url: record.telegram_url,
      email: record.email,
      description: record.description,
      opening_hours: record.opening_hours,
      image_url: record.image_url,
      logo_url: record.logo_url,
      provider_id: this.provider.provider_id,
      source_name: this.provider.provider_name,
      source_url: record.source_url,
      source_type: this.provider.provider_type,
      completeness_score: 0,
      verification_score: 0,
      publish_readiness_score: 0,
      duplicate_risk_score: 0,
      suburb_risk_score: 0,
      status: 'Pending Review',
      created_at: now,
      updated_at: now
    };
  }
}
