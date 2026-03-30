import { CanonicalBusiness, DiscoveryRequest, ProviderConfig, ProviderId } from '../../types';
import { providerCatalog } from '../providers/catalog';
import { getConnector } from '../connectors';

const freeTierOrder: ProviderId[] = [
  'geoapify',
  'opencage',
  'serpapi',
  'outscraper',
  'apify',
  'foursquare',
  'here',
  'tomtom',
  'osm_nominatim'
];

function orderedProviders(request: DiscoveryRequest): ProviderConfig[] {
  const { selector } = request;
  let candidates = providerCatalog.filter((provider) => selector.selectedProviders.includes(provider.provider_id));

  if (selector.selectAllSources) candidates = providerCatalog;
  if (selector.freeTierOnly) candidates = candidates.filter((provider) => provider.supports_free_tier);
  if (selector.mapPoiOnly) candidates = candidates.filter((provider) => provider.provider_type === 'poi');
  if (selector.enrichmentOnly) candidates = candidates.filter((provider) => provider.provider_type === 'scraping_enrichment');
  if (selector.fallbackSearchOnly) candidates = candidates.filter((provider) => provider.provider_type === 'search_fallback');
  if (selector.manualUploadsOnly) candidates = candidates.filter((provider) => provider.provider_type === 'manual_upload');

  if (selector.sourcePriorityMode === 'free-tier-first') {
    candidates.sort((a, b) => freeTierOrder.indexOf(a.provider_id) - freeTierOrder.indexOf(b.provider_id));
  } else if (selector.sourcePriorityMode === 'cheapest-first') {
    candidates.sort((a, b) => Number(b.supports_free_tier) - Number(a.supports_free_tier) || a.priority - b.priority);
  } else if (selector.sourcePriorityMode === 'best-coverage') {
    candidates.sort((a, b) => Number(b.supports_phone) + Number(b.supports_social) - (Number(a.supports_phone) + Number(a.supports_social)));
  } else {
    candidates.sort((a, b) => a.priority - b.priority);
  }

  return candidates;
}

export async function executeSelectedSources(request: DiscoveryRequest): Promise<Record<ProviderId, CanonicalBusiness[]>> {
  const providers = orderedProviders(request);
  const output: Partial<Record<ProviderId, CanonicalBusiness[]>> = {};
  const threshold = request.stopOnThreshold || Number.MAX_SAFE_INTEGER;
  let total = 0;

  const runOne = async (providerId: ProviderId) => {
    const connector = getConnector(providerId);
    const rows = await connector.searchBusinesses(request.selector);
    output[providerId] = rows;
    total += rows.length;
  };

  if (request.runInParallel) {
    for (let i = 0; i < providers.length; i += 3) {
      const chunk = providers.slice(i, i + 3);
      await Promise.all(chunk.map((provider) => runOne(provider.provider_id)));
      if (total >= threshold) break;
    }
  } else {
    for (const provider of providers) {
      await runOne(provider.provider_id);
      if (total >= threshold) break;
    }
  }

  return output as Record<ProviderId, CanonicalBusiness[]>;
}

export function shouldUseFallback(primaryResults: CanonicalBusiness[], minQuality: number): boolean {
  if (primaryResults.length === 0) return true;
  const avgQuality = primaryResults.reduce((acc, record) => acc + record.completeness_score, 0) / primaryResults.length;
  return avgQuality < minQuality;
}
