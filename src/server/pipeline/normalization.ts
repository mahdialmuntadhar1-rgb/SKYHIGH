import { CanonicalBusiness } from '../../types';

const placeholderTokens = ['n/a', 'na', 'none', 'unknown', '-', '--'];

export function normalizeBusinessName(name: string): string {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('0')) return `+964${cleaned.slice(1)}`;
  if (cleaned.startsWith('964')) return `+${cleaned}`;
  return cleaned;
}

export function isPlaceholder(value?: string): boolean {
  if (!value) return false;
  return placeholderTokens.includes(value.trim().toLowerCase());
}

export function normalizeAddress(address?: string): string | undefined {
  if (!address) return undefined;
  return address.trim().replace(/\s+/g, ' ');
}

export function normalizeLabels(city: string, district?: string) {
  return {
    city: city.trim(),
    district: district?.trim()
  };
}

export function applyNormalization(record: CanonicalBusiness): CanonicalBusiness {
  return {
    ...record,
    normalized_business_name: normalizeBusinessName(record.business_name),
    phone_primary: normalizePhone(record.phone_primary),
    phone_secondary: normalizePhone(record.phone_secondary),
    whatsapp_number: normalizePhone(record.whatsapp_number),
    address_normalized: normalizeAddress(record.address_text),
    city: normalizeLabels(record.city, record.district).city,
    district: normalizeLabels(record.city, record.district).district
  };
}
