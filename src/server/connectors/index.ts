import { ProviderId } from '../../types';
import { providerCatalog } from '../providers/catalog';
import { SourceConnector } from './base';
import { MockConnector } from './mockConnector';

const connectors = new Map<ProviderId, SourceConnector>();

for (const provider of providerCatalog) {
  connectors.set(provider.provider_id, new MockConnector(provider));
}

export function getConnector(providerId: ProviderId): SourceConnector {
  const connector = connectors.get(providerId);
  if (!connector) {
    throw new Error(`No connector registered for ${providerId}`);
  }
  return connector;
}
