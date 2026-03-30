import { CanonicalBusiness, ProviderConfig, SourceSelector } from '../../types';

export interface SourceConnector {
  provider: ProviderConfig;
  searchBusinesses(input: SourceSelector): Promise<CanonicalBusiness[]>;
  enrichBusiness(record: CanonicalBusiness): Promise<CanonicalBusiness>;
  validateRecord(record: CanonicalBusiness): Promise<CanonicalBusiness>;
  mapToCanonicalSchema(record: Record<string, any>, input: SourceSelector): CanonicalBusiness;
}
