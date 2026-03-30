import { CityConfig, Source } from './types';

export const IRAQ_CITIES: CityConfig[] = [
  {
    name: 'Baghdad',
    districts: [
      { name: 'Karkh', central_zones: ['Mansour', 'Yarmouk', 'Harthiya', 'Salhiya'] },
      { name: 'Rusafa', central_zones: ['Karrada', 'Jadriya', 'Zayouna', 'Adhamiya'] },
      { name: 'Central', central_zones: ['Bab Al-Sharqi', 'Mutanabbi', 'Rashid St'] }
    ]
  },
  {
    name: 'Erbil',
    districts: [
      { name: 'Central Erbil', central_zones: ['Citadel Area', 'Bakhtiyari', 'Dream City', 'Empire World'] },
      { name: 'Ankawa', central_zones: ['Ankawa Central', '100m Road'] }
    ]
  },
  {
    name: 'Basra',
    districts: [
      { name: 'Ashar', central_zones: ['Ashar Central', 'Corniche'] },
      { name: 'Jazaer', central_zones: ['Jazaer St', 'Abul Khasib Central'] }
    ]
  },
  {
    name: 'Sulaymaniyah',
    districts: [
      { name: 'Central Suly', central_zones: ['Salim St', 'Saholaka', 'Bakhtiari'] }
    ]
  },
  {
    name: 'Mosul',
    districts: [
      { name: 'Left Bank', central_zones: ['Zuhour', 'Muthanna', 'Masarif'] },
      { name: 'Right Bank', central_zones: ['Old City', 'Dawasah'] }
    ]
  }
];

export const SOURCES: Source[] = [
  {
    id: 'osm',
    name: 'OSM / Nominatim',
    type: 'api',
    freeTier: true,
    bulkSupport: false,
    socialSupport: false,
    priority: 1,
    enabled: true,
    description: 'Live geocoded place discovery from OpenStreetMap Nominatim.'
  },
  {
    id: 'gemini',
    name: 'Gemini Research',
    type: 'api',
    freeTier: false,
    bulkSupport: false,
    socialSupport: true,
    priority: 2,
    enabled: true,
    description: 'LLM-assisted research. Requires manual review and confidence checks.'
  },
  {
    id: 'foursquare',
    name: 'Foursquare',
    type: 'api',
    freeTier: false,
    bulkSupport: true,
    socialSupport: true,
    priority: 3,
    enabled: false,
    description: 'Not implemented in backend yet.'
  },
  {
    id: 'apify',
    name: 'Apify',
    type: 'scraper',
    freeTier: false,
    bulkSupport: true,
    socialSupport: true,
    priority: 4,
    enabled: false,
    description: 'Not implemented in backend yet.'
  }
];

export const CATEGORIES = [
  'Retail',
  'Food & Beverage',
  'Health & Medical',
  'Technology',
  'Education',
  'Finance',
  'Professional Services',
  'Manufacturing',
  'Logistics',
  'Hospitality',
  'Real Estate',
  'Automotive'
];
