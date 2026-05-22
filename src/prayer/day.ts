// Cached accessor for one day's prayer times.
import type { CalculationMethod, LocationData, PrayerDay } from "../types.js";
import { prayerFile } from "../cache/keys.js";
import { readCache, writeCache } from "../cache/store.js";
import { computePrayerDay, IncompleteLocationError, isComputable } from "./calculate.js";

export function getPrayerDay(
  loc: LocationData,
  method: CalculationMethod,
  date: string,
  showSeconds = false,
): PrayerDay {
  if (!isComputable(loc)) throw new IncompleteLocationError();

  const key = prayerFile(
    date,
    loc.latitude,
    loc.longitude,
    `${method}${showSeconds ? "-s" : ""}`,
  );

  const cached = readCache<PrayerDay>(key);
  if (cached?.data?.date === date && cached.data.prayers?.length === 5) {
    return cached.data;
  }

  const day = computePrayerDay(loc, method, date, showSeconds);
  try {
    writeCache(key, day);
  } catch {
    // Read-only filesystem — rendering must not depend on the cache write.
  }
  return day;
}
