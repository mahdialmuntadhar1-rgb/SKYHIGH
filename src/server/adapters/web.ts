import { Business } from "../../types";
import { DiscoveryAdapter } from "./base";

interface NominatimResult {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    road?: string;
    house_number?: string;
  };
  extratags?: {
    phone?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
}

export class WebDirectoryAdapter implements DiscoveryAdapter {
  id = 'osm' as const;
  name = 'OSM / Nominatim';

  async discover(city: string, category: string): Promise<Partial<Business>[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const q = encodeURIComponent(`${category} in ${city}, Iraq`);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=jsonv2&addressdetails=1&extratags=1&limit=30`;

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'skyhigh-discovery/1.0',
          'Accept-Language': 'en',
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim request failed with status ${response.status}`);
      }

      const results = (await response.json()) as NominatimResult[];

      return results
        .map((place) => {
          const derivedName = place.name || place.display_name.split(',')[0]?.trim();
          if (!derivedName) {
            return null;
          }

          const addressLine = [place.address?.road, place.address?.house_number].filter(Boolean).join(' ').trim();
          const cityName = place.address?.city || place.address?.town || place.address?.village || city;

          return {
            name: derivedName,
            category,
            city: cityName,
            governorate: place.address?.state,
            address: addressLine || place.display_name,
            phone: place.extratags?.phone,
            website: place.extratags?.website,
            facebook_url: place.extratags?.facebook,
            instagram_url: place.extratags?.instagram,
            source: 'osm',
            source_url: `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}`,
            confidence_score: 0.95,
            raw_data: {
              place_id: place.place_id,
              osm_type: place.type,
              lat: place.lat,
              lon: place.lon,
            },
          } as Partial<Business>;
        })
        .filter((result): result is Partial<Business> => Boolean(result));
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Nominatim request timed out');
      }
      throw new Error(`OSM discovery failed: ${error.message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
