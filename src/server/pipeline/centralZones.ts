export const centralCityZoneAllowlists: Record<string, string[]> = {
  Baghdad: ['Karrada', 'Bab Al-Muadham', 'Mansour Core', 'Rusafa Core'],
  Erbil: ['Downtown Erbil', 'Iskan Core', 'Citadel Zone'],
  Basra: ['Ashar', 'Basra Center'],
  Mosul: ['Old Mosul Core', 'Mosul Center'],
  Sulaymaniyah: ['Salim Street Core', 'City Center'],
  Najaf: ['Najaf Old Center', 'Al-Sadeer Core'],
  Karbala: ['Karbala Center', 'Bab Baghdad Core']
};

export function isCentralZone(city: string, districtOrZone?: string): boolean {
  if (!districtOrZone) return false;
  const allowed = centralCityZoneAllowlists[city] || [];
  return allowed.some((zone) => zone.toLowerCase() === districtOrZone.toLowerCase());
}
