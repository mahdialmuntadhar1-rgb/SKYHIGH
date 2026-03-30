import { Business } from "../../types";
import { DiscoveryAdapter } from "./base";

export class OvertureAdapter implements DiscoveryAdapter {
  id = 'overture' as const;
  name = 'Overture Maps';

  async discover(city: string, category: string): Promise<Partial<Business>[]> {
    // In a real app, this would query the Overture Maps dataset (e.g. via DuckDB or Athena)
    console.log(`Overture discovery for ${category} in ${city}`);
    
    // Mocking for now as per instructions to keep compatibility
    return [
      {
        name: `${category} Overture ${city}`,
        local_name: `${category} أوفرتشر ${city}`,
        category,
        city,
        address: `Overture Point, ${city}`,
        phone: "+964 222 222 222",
        source: 'overture',
        source_url: 'https://overturemaps.org',
        confidence_score: 0.85,
        coverage_type: 'discovery'
      }
    ];
  }
}
