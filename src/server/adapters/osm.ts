import { Business } from "../../types";
import { DiscoveryAdapter } from "./base";

export class OSMAdapter implements DiscoveryAdapter {
  id = 'osm' as const;
  name = 'OpenStreetMap / Overpass';

  async discover(city: string, category: string): Promise<Partial<Business>[]> {
    // In a real app, this would use the Overpass API
    // e.g. https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="${category}"](around:5000,${lat},${lon});out;
    console.log(`OSM discovery for ${category} in ${city}`);
    
    // Mocking for now as per instructions to keep compatibility
    return [
      {
        name: `${category} OSM ${city}`,
        local_name: `${category} خريطة ${city}`,
        category,
        city,
        address: `OSM Point, ${city}`,
        phone: "+964 111 111 111",
        source: 'osm',
        source_url: 'https://www.openstreetmap.org',
        confidence_score: 0.7,
        coverage_type: 'discovery'
      }
    ];
  }
}
