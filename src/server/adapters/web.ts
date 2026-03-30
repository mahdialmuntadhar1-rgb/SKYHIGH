import { Business } from '../../types';
import { DiscoveryAdapter } from './base';

type NominatimPlace = {
  place_id: number;
  display_name: string;
  name?: string;
  type?: string;
  lat?: string;
  lon?: string;
  osm_type?: string;
  osm_id?: number;
};

export class WebDirectoryAdapter implements DiscoveryAdapter {
  id = 'osm_nominatim' as const;
  name = 'OSM / Nominatim';

  async discover(city: string, category: string): Promise<Partial<Business>[]> {
    const query = `${category} in ${city}, Iraq`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=25&q=${encodeURIComponent(query)}`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'skyhigh-collector/1.0 (business discovery)'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim HTTP ${response.status}`);
      }

      const places = (await response.json()) as NominatimPlace[];

      return places
        .filter((place) => place.display_name)
        .map((place) => {
          const mappedName = place.name || place.display_name.split(',')[0]?.trim();
          const sourceUrl = place.osm_type && place.osm_id
            ? `https://www.openstreetmap.org/${place.osm_type}/${place.osm_id}`
            : `https://nominatim.openstreetmap.org/ui/search.html?q=${encodeURIComponent(mappedName || query)}`;

          return {
            name: mappedName || place.display_name,
            category,
            city,
            address: place.display_name,
            latitude: place.lat ? Number(place.lat) : null,
            longitude: place.lon ? Number(place.lon) : null,
            source: this.id,
            source_url: sourceUrl,
            confidence_score: 0.9,
            raw_data: place,
          };
        });
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new Error('Nominatim request timed out');
      }
      throw new Error(`Nominatim discovery failed: ${error?.message || 'unknown error'}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
