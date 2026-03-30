import { Business, DiscoveryRequest, DiscoveryResult, DiscoverySource } from '../types';
import { GeminiAdapter } from './adapters/gemini';
import { OSMAdapter } from './adapters/web';
import { supabase } from './supabase';

const adapters = [new GeminiAdapter(), new OSMAdapter()];

const adapterById = new Map(adapters.map((adapter) => [adapter.id, adapter]));

function normalizeText(value?: string) {
  return (value || '').trim().toLowerCase();
}

function normalizePhone(value?: string) {
  return (value || '').replace(/[^\d+]/g, '');
}

async function existsInDatabase(biz: Partial<Business>) {
  const city = normalizeText(biz.city);
  const name = normalizeText(biz.name);
  const phone = normalizePhone(biz.phone);

  if (!city || !name) return false;

  const { data: byName, error: byNameError } = await supabase
    .from('businesses')
    .select('id,name,phone,city')
    .ilike('city', city)
    .ilike('name', `%${name}%`)
    .limit(30);

  if (byNameError) {
    console.error('Dedup name query failed:', byNameError.message);
    return false;
  }

  let phoneRows: { id: string; name: string; phone: string | null; city: string }[] = [];
  if (phone) {
    const { data: byPhone, error: byPhoneError } = await supabase
      .from('businesses')
      .select('id,name,phone,city')
      .ilike('city', city)
      .eq('phone', phone)
      .limit(30);

    if (byPhoneError) {
      console.error('Dedup phone query failed:', byPhoneError.message);
      return false;
    }

    phoneRows = byPhone || [];
  }

  const rows = [...(byName || []), ...phoneRows];

  return rows.some((record) => {
    const sameName = normalizeText(record.name) === name;
    const sameCity = normalizeText(record.city) === city;
    const samePhone = phone && normalizePhone(record.phone) === phone;
    return sameCity && (sameName || Boolean(samePhone));
  });
}

function toInsertPayload(biz: Partial<Business>): Partial<Business> | null {
  if (!biz.name || !biz.city || !biz.category || !biz.source) return null;

  return {
    name: biz.name.trim(),
    local_name: biz.local_name,
    category: biz.category.trim(),
    city: biz.city.trim(),
    governorate: biz.governorate,
    address: biz.address,
    phone: normalizePhone(biz.phone) || null,
    website: biz.website,
    facebook_url: biz.facebook_url,
    instagram_url: biz.instagram_url,
    source: biz.source,
    source_url: biz.source_url,
    confidence_score: typeof biz.confidence_score === 'number' ? biz.confidence_score : 0.5,
    latitude: biz.latitude,
    longitude: biz.longitude
  };
}

export function getAvailableSourceIds(): DiscoverySource[] {
  return adapters.map((a) => a.id);
}

export async function runDiscovery(req: DiscoveryRequest): Promise<DiscoveryResult> {
  const { city, category, sources } = req;
  const collected: Partial<Business>[] = [];
  const errors: string[] = [];

  for (const sourceId of sources) {
    const adapter = adapterById.get(sourceId);
    if (!adapter) {
      errors.push(`${sourceId}: source is not implemented`);
      continue;
    }

    console.log(`[run] source started: ${sourceId} city=${city} category=${category}`);
    try {
      const found = await adapter.discover(city, category);
      console.log(`[run] source finished: ${sourceId} found=${found.length}`);
      collected.push(...found);
    } catch (err: any) {
      console.error(`[run] source failed: ${sourceId}`, err);
      errors.push(`${sourceId}: ${err.message}`);
    }
  }

  let insertedCount = 0;
  let skippedCount = 0;

  for (const biz of collected) {
    const payload = toInsertPayload(biz);
    if (!payload) {
      skippedCount += 1;
      errors.push(`Skipped invalid business payload from source ${biz.source || 'unknown'}`);
      continue;
    }

    if (await existsInDatabase(payload)) {
      skippedCount += 1;
      continue;
    }

    const { error } = await supabase.from('businesses').insert(payload);

    if (error) {
      errors.push(`Insert error for ${payload.name}: ${error.message}`);
    } else {
      insertedCount += 1;
    }
  }

  console.log(`[run] completed inserted=${insertedCount} skipped=${skippedCount} errors=${errors.length}`);

  return {
    summary: `Discovery completed for ${category} in ${city}.`,
    insertedCount,
    skippedCount,
    errors
  };
}
