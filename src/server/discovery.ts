import { z } from 'zod';
import { Business, DiscoveryRequest, DiscoveryResult } from '../types';
import { GeminiAdapter } from './adapters/gemini';
import { WebDirectoryAdapter } from './adapters/web';
import { supabase } from './supabase';

const adapters = [new GeminiAdapter(), new WebDirectoryAdapter()];

const requestSchema = z.object({
  city: z.string().min(1),
  category: z.string().min(1),
  sources: z.array(z.enum(['gemini', 'osm'])).min(1),
});

const normalizeText = (value?: string | null) => value?.trim().toLowerCase() || '';

async function isDuplicate(business: Partial<Business>): Promise<boolean> {
  const normalizedName = normalizeText(business.name);
  const normalizedPhone = normalizeText(business.phone);

  if (!normalizedName) {
    return true;
  }

  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, phone')
    .eq('city', business.city)
    .limit(200);

  if (error) {
    throw new Error(`Duplicate check failed: ${error.message}`);
  }

  return (data || []).some((existing) => {
    const existingName = normalizeText(existing.name);
    const existingPhone = normalizeText(existing.phone);
    return existingName === normalizedName || (normalizedPhone !== '' && existingPhone === normalizedPhone);
  });
}

function toInsertableBusiness(candidate: Partial<Business>, city: string, category: string) {
  return {
    name: candidate.name?.trim(),
    local_name: candidate.local_name?.trim() || null,
    category: candidate.category || category,
    city: candidate.city || city,
    governorate: candidate.governorate || null,
    address: candidate.address || null,
    phone: candidate.phone || null,
    website: candidate.website || null,
    facebook_url: candidate.facebook_url || null,
    instagram_url: candidate.instagram_url || null,
    source: candidate.source || 'unknown',
    source_url: candidate.source_url || null,
    confidence_score: candidate.confidence_score ?? 0.5,
  };
}

export function validateDiscoveryRequest(body: unknown): DiscoveryRequest {
  return requestSchema.parse(body);
}

export async function runDiscovery(req: DiscoveryRequest): Promise<DiscoveryResult> {
  const { city, category, sources } = req;
  const candidates: Partial<Business>[] = [];
  const errors: string[] = [];

  console.log(`[run] start city=${city} category=${category} sources=${sources.join(',')}`);

  for (const sourceId of sources) {
    const adapter = adapters.find((item) => item.id === sourceId);
    if (!adapter) {
      errors.push(`Unsupported source: ${sourceId}`);
      continue;
    }

    try {
      console.log(`[run] source_started source=${sourceId}`);
      const found = await adapter.discover(city, category);
      console.log(`[run] source_finished source=${sourceId} found=${found.length}`);
      candidates.push(...found);
    } catch (error: any) {
      console.error(`[run] source_failed source=${sourceId} error=${error.message}`);
      errors.push(`${sourceId}: ${error.message}`);
    }
  }

  let insertedCount = 0;
  let skippedCount = 0;

  for (const candidate of candidates) {
    if (!candidate.name) {
      skippedCount += 1;
      continue;
    }

    try {
      const duplicate = await isDuplicate({ ...candidate, city: candidate.city || city });
      if (duplicate) {
        skippedCount += 1;
        continue;
      }

      const payload = toInsertableBusiness(candidate, city, category);
      const { error } = await supabase.from('businesses').insert(payload);

      if (error) {
        errors.push(`Insert error for ${candidate.name}: ${error.message}`);
      } else {
        insertedCount += 1;
      }
    } catch (error: any) {
      errors.push(`Processing error for ${candidate.name}: ${error.message}`);
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
