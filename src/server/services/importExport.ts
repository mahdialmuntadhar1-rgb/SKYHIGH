import { CanonicalBusiness, ImportExportReports, ProviderPerformance, ProviderId, UploadFile } from '../../types';

function parseCsv(content: string): Record<string, string>[] {
  const [headerLine, ...lines] = content.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(',').map((header) => header.trim());
  return lines.map((line) => {
    const cols = line.split(',');
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = (cols[index] || '').trim();
      return acc;
    }, {});
  });
}

function parseXlsx(content: string): Record<string, string>[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function toCanonical(raw: Record<string, string>, provider: ProviderId): CanonicalBusiness {
  const now = new Date().toISOString();
  return {
    business_name: raw.business_name || raw.name || '',
    normalized_business_name: (raw.business_name || raw.name || '').toLowerCase().trim(),
    category: raw.category || 'Uncategorized',
    subcategory: raw.subcategory,
    city: raw.city || 'Unknown',
    district: raw.district,
    city_center_zone: raw.city_center_zone,
    coverage_type: 'unknown',
    address_text: raw.address_text || raw.address,
    address_normalized: raw.address_text || raw.address,
    google_maps_url: raw.google_maps_url,
    latitude: raw.latitude ? Number(raw.latitude) : undefined,
    longitude: raw.longitude ? Number(raw.longitude) : undefined,
    phone_primary: raw.phone_primary || raw.phone,
    phone_secondary: raw.phone_secondary,
    whatsapp_number: raw.whatsapp_number,
    website_url: raw.website_url || raw.website,
    facebook_url: raw.facebook_url,
    instagram_url: raw.instagram_url,
    tiktok_url: raw.tiktok_url,
    telegram_url: raw.telegram_url,
    email: raw.email,
    description: raw.description,
    opening_hours: raw.opening_hours,
    image_url: raw.image_url,
    logo_url: raw.logo_url,
    provider_id: provider,
    source_name: provider,
    source_url: raw.source_url,
    source_type: 'manual_upload',
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

export function importFromFiles(files: UploadFile[] = []): CanonicalBusiness[] {
  const imported: CanonicalBusiness[] = [];

  for (const file of files) {
    const lower = file.fileName.toLowerCase();
    if (lower.endsWith('.csv')) {
      imported.push(...parseCsv(file.content).map((row) => toCanonical(row, 'csv_upload')));
    } else if (lower.endsWith('.xlsx')) {
      imported.push(...parseXlsx(file.content).map((row) => toCanonical(row, 'xlsx_upload')));
    } else if (lower.endsWith('.json')) {
      const parsed = JSON.parse(file.content);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      imported.push(...rows.map((row) => toCanonical(row, 'json_upload')));
    }
  }

  return imported;
}

export function buildReports(records: CanonicalBusiness[], providerPerformance: ProviderPerformance[]): ImportExportReports {
  const rejected = records.filter((record) => record.status === 'Rejected');
  const incomplete = records.filter((record) => record.completeness_score < 0.6);
  const duplicates = records.filter((record) => record.duplicate_risk_score > 0.5);
  const exportReady = records.filter((record) => record.status === 'Export Ready' || record.status === 'Verified');

  return {
    importSummary: `Imported ${records.length} canonical records.`,
    rejectedRowsReport: rejected.map((record) => `${record.business_name}: ${record.verification_notes?.join('; ') || 'Rejected by QC rules'}`),
    duplicateReport: duplicates.map((record) => `${record.business_name} (${record.city}) duplicate risk ${record.duplicate_risk_score}`),
    incompleteReport: incomplete.map((record) => `${record.business_name} completeness ${record.completeness_score}`),
    exportReadyReport: exportReady.map((record) => `${record.business_name} ready with score ${record.publish_readiness_score}`),
    providerPerformanceReport: providerPerformance.map((perf) => `${perf.provider_id}: fetched=${perf.fetched}, accepted=${perf.accepted}, rejected=${perf.rejected}`)
  };
}

export function exportRecords(records: CanonicalBusiness[], format: 'csv' | 'json'): string {
  if (format === 'json') return JSON.stringify(records, null, 2);

  const headers = ['business_name', 'category', 'city', 'district', 'phone_primary', 'website_url', 'status'];
  const lines = records.map((record) => headers.map((header) => String((record as any)[header] || '')).join(','));
  return [headers.join(','), ...lines].join('\n');
}
