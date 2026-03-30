import { z } from 'zod';
import { Business, DiscoveryRequest, DiscoveryResult, DiscoverySource } from '../types';
import { GeminiAdapter } from './adapters/gemini';
import { WebDirectoryAdapter } from './adapters/web';
import { supabase } from './supabase';

const adapters = [
  new GeminiAdapter(),
  new WebDirectoryAdapter(),
];

const validSources = adapters.map((a) => a.id) as [DiscoverySource, ...DiscoverySource[]];

const discoveryRequestSchema = z.object({
  city: z.string().trim().min(1),
  category: z.string().trim().min(1),
  sources: z.array(z.enum(validSources)).min(1),
});

function normalizeText(value?: string | null): string {
  return (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizePhone(value?: string | null): string {
  return (value || '').replace(/[^\d+]/g, '');
}

async function findExistingBusiness(biz: Partial<Business>) {
  const baseQuery = supabase
    .from('businesses')
    .select('id,name,phone,address')
    .eq('city', biz.city)
    .limit(60);

  const withCategory = biz.category ? baseQuery.eq('category', biz.category) : baseQuery;
  const { data, error } = await withCategory;

  if (error) {
    throw error;
  }

  const nameNorm = normalizeText(biz.name);
  const phoneNorm = normalizePhone(biz.phone);
  const addressNorm = normalizeText(biz.address);

  return (data || []).find((existing) => {
    const existingName = normalizeText(existing.name);
    const existingPhone = normalizePhone(existing.phone);
    const existingAddress = normalizeText(existing.address);

    const sameName = nameNorm && existingName === nameNorm;
    const samePhone = phoneNorm && existingPhone && existingPhone === phoneNorm;
    const sameAddress = addressNorm && existingAddress === addressNorm;

    return samePhone || (sameName && sameAddress) || sameName;
  });
}

export async function runDiscovery(rawReq: DiscoveryRequest): Promise<DiscoveryResult> {
  const req = discoveryRequestSchema.parse(rawReq);
  const { city, category, sources } = req;

  console.log(`[run] starting discovery city=${city} category=${category} sources=${sources.join(',')}`);

  const results: Partial<Business>[] = [];
  const errors: string[] = [];

  for (const sourceId of sources) {
    const adapter = adapters.find((a) => a.id === sourceId);
    if (!adapter) {
      errors.push(`${sourceId}: unsupported source`);
      continue;
    }

    console.log(`[run] source_started source=${sourceId}`);
    try {
      const found = await adapter.discover(city, category);
      console.log(`[run] source_finished source=${sourceId} found=${found.length}`);
      results.push(...found);
    } catch (err: any) {
      const message = `${sourceId}: ${err?.message || 'unknown error'}`;
      console.error(`[run] source_failed ${message}`);
      errors.push(message);
    }
  }

  let insertedCount = 0;
  let skippedCount = 0;

  for (const biz of results) {
    if (!biz.name || !biz.city || !biz.category || !biz.source) {
      skippedCount++;
      errors.push(`Skipped invalid record missing required fields (${biz.name || 'unknown'})`);
      continue;
    }

    try {
      const existing = await findExistingBusiness(biz);
      if (existing) {
        skippedCount++;
        continue;
      }

      const insertPayload = {
        name: biz.name,
        local_name: biz.local_name ?? null,
        category: biz.category,
        city: biz.city,
        address: biz.address ?? null,
        phone: biz.phone ?? null,
        website: biz.website ?? null,
        facebook_url: biz.facebook_url ?? null,
        instagram_url: biz.instagram_url ?? null,
        source: biz.source,
        source_url: biz.source_url ?? null,
        confidence_score: biz.confidence_score ?? null,
      };

      const { error } = await supabase.from('businesses').insert(insertPayload);
      if (error) {
        errors.push(`Insert error for ${biz.name}: ${error.message}`);
      } else {
        insertedCount++;
      }
    } catch (error: any) {
      errors.push(`Insert error for ${biz.name}: ${error?.message || 'unknown error'}`);
    }
  }

  console.log(`[run] completed inserted=${insertedCount} skipped=${skippedCount} errors=${errors.length}`);

  return {
    summary: `Discovery completed for ${category} in ${city}.`,
    insertedCount,
    skippedCount,
    errors,
  };
}
