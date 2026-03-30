import { CanonicalBusiness, DiscoveryRequest, DiscoveryResult, ProviderPerformance } from '../types';
import { executeSelectedSources, shouldUseFallback } from './pipeline/execution';
import { mergeRecords } from './pipeline/merge';
import { applyNormalization } from './pipeline/normalization';
import { validateRecord } from './pipeline/validation';
import { applyQcWorkflow } from './pipeline/qc';
import { buildReports, importFromFiles } from './services/importExport';
import { getConnector } from './connectors';

export async function runDiscovery(request: DiscoveryRequest): Promise<DiscoveryResult> {
  const errors: string[] = [];
  const providerPerformance: ProviderPerformance[] = [];

  const executionOutput = await executeSelectedSources(request);
  const allRecords: CanonicalBusiness[] = [];

  for (const [providerId, records] of Object.entries(executionOutput)) {
    const connector = getConnector(providerId as any);
    let accepted = 0;
    let rejected = 0;

    for (const record of records) {
      try {
        let canonical = applyNormalization(record);
        canonical = await connector.enrichBusiness(canonical);
        canonical = await connector.validateRecord(canonical);
        canonical = applyQcWorkflow(canonical);

        if (canonical.status === 'Rejected') rejected += 1;
        else accepted += 1;

        allRecords.push(canonical);
      } catch (error: any) {
        errors.push(`${providerId}: ${error.message}`);
      }
    }

    providerPerformance.push({
      provider_id: providerId as any,
      fetched: records.length,
      accepted,
      rejected
    });
  }

  const imported = importFromFiles(request.files);
  allRecords.push(...imported.map((record) => applyQcWorkflow(validateRecord(applyNormalization(record), request.selector.verificationStrictness))));

  const merged = mergeRecords(allRecords);
  const primaryRecords = merged.filter((record) => ['poi', 'scraping_enrichment'].includes(record.source_type));

  if (shouldUseFallback(primaryRecords, 0.65)) {
    errors.push('Primary data quality is weak. Fallback sources were recommended for this run.');
  }

  const reports = buildReports(merged, providerPerformance);

  return {
    summary: `Processed ${merged.length} canonical records for ${request.selector.category} in ${request.selector.city}.`,
    insertedCount: merged.filter((record) => ['Verified', 'Export Ready'].includes(record.status)).length,
    skippedCount: merged.filter((record) => ['Rejected', 'Outside Central Coverage'].includes(record.status)).length,
    errors,
    records: merged,
    reports,
    providerPerformance
  };
}
