// Cache file names and TTLs.

export const LOCATION_FILE = "location.json";
export const META_FILE = "meta.json";
export const LOCATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Prayer cache file, keyed by date and every input that affects the result.
export function prayerFile(
  date: string,
  latitude: number,
  longitude: number,
  methodTag: string,
): string {
  return `prayers-${date}-${latitude.toFixed(4)}_${longitude.toFixed(4)}_${methodTag}.json`;
}
