// Cached accessor for one day's prayer times.
import { PRAYER_ORDER } from "../types.js";
import type {
  CalculationMethod,
  LocationData,
  PrayerDay,
  PrayerOffsets,
} from "../types.js";
import { prayerFile } from "../cache/keys.js";
import { readCache, writeCache } from "../cache/store.js";
import { computePrayerDay, IncompleteLocationError, isComputable } from "./calculate.js";

export function getPrayerDay(
  loc: LocationData,
  method: CalculationMethod,
  date: string,
  showSeconds = false,
  adjustments?: PrayerOffsets,
): PrayerDay {
  if (!isComputable(loc)) throw new IncompleteLocationError();

  // The offsets change the result, so they must vary the cache key.
  const offsets = adjustments ? PRAYER_ORDER.map((n) => adjustments[n] ?? 0) : [];
  const adjTag = offsets.some((v) => v !== 0) ? `-adj${offsets.join("_")}` : "";

  const key = prayerFile(
    date,
    loc.latitude,
    loc.longitude,
    `${method}${showSeconds ? "-s" : ""}${adjTag}`,
  );

  const cached = readCache<PrayerDay>(key);
  if (cached?.data?.date === date && cached.data.prayers?.length === 5) {
    return cached.data;
  }

  const day = computePrayerDay(loc, method, date, showSeconds, adjustments);
  try {
    writeCache(key, day);
  } catch {
    // Read-only filesystem — rendering must not depend on the cache write.
  }
  return day;
}
