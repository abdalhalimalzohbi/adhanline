// Render state assembled from config: today's prayers, the resolved next
// prayer (with midnight rollover), and the Hijri date.
import { DateTime } from "luxon";
import type {
  Config,
  ComputedPrayer,
  NextPrayerInfo,
  PrayerDay,
  PrayerName,
} from "../types.js";
import { isComputable } from "../prayer/calculate.js";
import { getPrayerDay } from "../prayer/day.js";
import { hijriDate } from "../prayer/hijri.js";
import { resolveNextPrayer } from "../prayer/next-prayer.js";

export interface RenderState {
  config: Config;
  now: DateTime;
  today: PrayerDay;
  next: NextPrayerInfo;
  hijri: string;
}

function byName(day: PrayerDay, name: PrayerName): ComputedPrayer {
  const found = day.prayers.find((p) => p.name === name);
  if (!found) throw new Error(`prayer ${name} missing from ${day.date}`);
  return found;
}

export function buildState(config: Config, nowOverride?: DateTime): RenderState {
  const loc = config.location;
  if (!isComputable(loc)) {
    throw new Error("buildState requires a computable location");
  }
  const now = nowOverride ?? DateTime.now().setZone(loc.timezone);
  const { method } = config.calculation;
  const seconds = config.display.showSeconds;
  const day = (offset: number) =>
    getPrayerDay(
      loc,
      method,
      now.plus({ days: offset }).toFormat("yyyy-MM-dd"),
      seconds,
      config.adjustments,
    );

  const today = day(0);
  const next = resolveNextPrayer(
    today,
    byName(day(-1), "isha"),
    byName(day(1), "fajr"),
    now,
  );
  return { config, now, today, next, hijri: hijriDate(now.toJSDate(), loc.timezone) };
}
