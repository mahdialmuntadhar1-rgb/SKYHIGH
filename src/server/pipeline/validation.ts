import { CanonicalBusiness } from '../../types';
import { isPlaceholder } from './normalization';
import { isCentralZone } from './centralZones';

const urlRegex = /^https?:\/\//i;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidUrl(url?: string): boolean {
  if (!url) return false;
  return urlRegex.test(url);
}

export function isValidSocial(url?: string): boolean {
  if (!url) return false;
  return isValidUrl(url);
}

export function validateRecord(record: CanonicalBusiness, strictness = 0.7): CanonicalBusiness {
  const notes: string[] = [];

  if (!record.business_name || isPlaceholder(record.business_name)) {
    notes.push('Invalid or missing business name');
  }

  const hasContact = Boolean(record.phone_primary) || Boolean(record.facebook_url) || Boolean(record.instagram_url);
  if (!hasContact) notes.push('Missing contact method (phone/social)');

  if (!record.address_text && (record.latitude === undefined || record.longitude === undefined)) {
    notes.push('Missing address/map location');
  }

  if (!record.city || !record.district) notes.push('Missing city/district labels');

  if (record.website_url && !isValidUrl(record.website_url)) notes.push('Invalid website URL');
  if (record.facebook_url && !isValidSocial(record.facebook_url)) notes.push('Invalid Facebook URL');
  if (record.instagram_url && !isValidSocial(record.instagram_url)) notes.push('Invalid Instagram URL');
  if (record.email && !emailRegex.test(record.email)) notes.push('Invalid email format');

  const centralMatch = isCentralZone(record.city, record.city_center_zone || record.district);
  const outsideCentral = !centralMatch;

  const completeness = getCompletenessScore(record);
  const verification = Math.max(0, completeness - notes.length * 0.08);
  const publishReadiness = outsideCentral ? Math.min(verification, 0.45) : verification;

  const status =
    outsideCentral
      ? 'Outside Central Coverage'
      : publishReadiness >= strictness
      ? 'Verified'
      : notes.length > 2
      ? 'Needs Cleaning'
      : 'Needs Verification';

  return {
    ...record,
    coverage_type: outsideCentral ? 'outside_central' : 'central',
    completeness_score: completeness,
    verification_score: verification,
    publish_readiness_score: publishReadiness,
    suburb_risk_score: outsideCentral ? 1 : 0,
    verification_notes: notes,
    status
  };
}

export function getCompletenessScore(record: CanonicalBusiness): number {
  const fields = [
    record.business_name,
    record.category,
    record.city,
    record.district,
    record.phone_primary || record.facebook_url || record.instagram_url,
    record.address_text || `${record.latitude || ''}${record.longitude || ''}`
  ];

  const present = fields.filter(Boolean).length;
  return Number((present / fields.length).toFixed(2));
}
