import { Business } from "../../types";
import { DiscoveryAdapter } from "./base";

export class FoursquareAdapter implements DiscoveryAdapter {
  id = 'foursquare' as const;
  name = 'Foursquare';

  async discover(city: string, category: string): Promise<Partial<Business>[]> {
    const apiKey = process.env.FOURSQUARE_API_KEY;
    if (!apiKey) {
      console.warn("FOURSQUARE_API_KEY not found, skipping Foursquare adapter.");
      return [];
    }

    // In a real app, this would use the Foursquare Places API
    // e.g. https://api.foursquare.com/v3/places/search?query=${category}&near=${city}
    console.log(`Foursquare discovery for ${category} in ${city}`);
    
    // Mocking for now as per instructions to keep compatibility
    return [
      {
        name: `${category} Foursquare ${city}`,
        local_name: `${category} فورسكوير ${city}`,
        category,
        city,
        address: `Foursquare Point, ${city}`,
        phone: "+964 333 333 333",
        source: 'foursquare',
        source_url: 'https://foursquare.com',
        confidence_score: 0.9,
        coverage_type: 'enrichment'
      }
    ];
  }
}
