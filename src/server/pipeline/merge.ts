import { CanonicalBusiness, ProviderId } from '../../types';

function keyOf(record: CanonicalBusiness): string {
  const phone = record.phone_primary || '';
  return `${record.normalized_business_name}|${record.city.toLowerCase()}|${phone}`;
}

export function mergeRecords(records: CanonicalBusiness[]): CanonicalBusiness[] {
  const grouped = new Map<string, CanonicalBusiness[]>();
  for (const record of records) {
    const key = keyOf(record);
    const list = grouped.get(key) || [];
    list.push(record);
    grouped.set(key, list);
  }

  return [...grouped.values()].map((matches) => mergeGroup(matches));
}

function mergeGroup(matches: CanonicalBusiness[]): CanonicalBusiness {
  const base = { ...matches[0] };
  const providers = Array.from(new Set(matches.map((item) => item.provider_id)));
  const attr: Record<string, ProviderId[]> = {};
  const conf: Record<string, number> = {};

  const fill = <K extends keyof CanonicalBusiness>(field: K) => {
    const candidates = matches.map((item) => item[field]).filter(Boolean);
    if (!candidates.length) return;

    const frequencies = new Map<string, number>();
    for (const candidate of candidates) {
      const key = String(candidate);
      frequencies.set(key, (frequencies.get(key) || 0) + 1);
    }

    const [best] = [...frequencies.entries()].sort((a, b) => b[1] - a[1]);
    const winner = candidates.find((candidate) => String(candidate) === best[0]);
    base[field] = winner as CanonicalBusiness[K];

    attr[String(field)] = matches
      .filter((item) => String(item[field] || '') === best[0])
      .map((item) => item.provider_id);
    conf[String(field)] = Number((best[1] / matches.length).toFixed(2));
  };

  fill('address_text');
  fill('phone_primary');
  fill('website_url');
  fill('facebook_url');
  fill('instagram_url');
  fill('district');
  fill('city_center_zone');

  base.field_attribution = attr;
  base.field_confidence = conf;
  base.evidence_sources = providers;
  base.duplicate_risk_score = matches.length > 1 ? 0.1 : 0;

  return base;
}
