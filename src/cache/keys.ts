// Cache file names and TTLs.

export const LOCATION_FILE = "location.json";
export const META_FILE = "meta.json";
export const LOCATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Bump when the cached PrayerDay shape or formatting changes, so old entries
// are ignored rather than served stale. v2: 12-hour clocks + offset support.
const PRAYER_CACHE_VERSION = 2;

// Prayer cache file, keyed by date and every input that affects the result.
export function prayerFile(
  date: string,
  latitude: number,
  longitude: number,
  methodTag: string,
): string {
  return `prayers-v${PRAYER_CACHE_VERSION}-${date}-${latitude.toFixed(4)}_${longitude.toFixed(4)}_${methodTag}.json`;
}
