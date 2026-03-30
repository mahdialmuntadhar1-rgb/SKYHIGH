import { Business } from '../../types';
import { DiscoveryAdapter } from './base';

interface NominatimResult {
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  category?: string;
  osm_type?: string;
  osm_id?: number;
}

export class OSMAdapter implements DiscoveryAdapter {
  id = 'osm' as const;
  name = 'OSM / Nominatim';

  async discover(city: string, category: string): Promise<Partial<Business>[]> {
    const query = encodeURIComponent(`${category} in ${city}, Iraq`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=jsonv2&addressdetails=1&limit=25`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'skyhigh-discovery/1.0'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`OSM request failed with status ${response.status}`);
      }

      const places = (await response.json()) as NominatimResult[];

      return places
        .filter((p) => p.display_name)
        .map((p) => {
          const label = p.name || p.display_name.split(',')[0]?.trim();
          const osmPath = p.osm_type && p.osm_id ? `${p.osm_type}/${p.osm_id}` : '';

          return {
            name: label || p.display_name,
            category,
            city,
            address: p.display_name,
            latitude: Number(p.lat),
            longitude: Number(p.lon),
            source: 'osm',
            source_url: osmPath ? `https://www.openstreetmap.org/${osmPath}` : 'https://nominatim.openstreetmap.org',
            confidence_score: 0.92
          };
        });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('OSM request timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
