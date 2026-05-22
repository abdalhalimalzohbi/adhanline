// Local prayer-time calculation: adhan + luxon. No network; all wall-clock
// values are in the location's IANA timezone and DST-safe.
import Adhan from "adhan";
import { DateTime } from "luxon";
import { PRAYER_ORDER } from "../types.js";
import type {
  CalculationMethod,
  ComputedPrayer,
  LocationData,
  PrayerDay,
  PrayerOffsets,
} from "../types.js";

export class IncompleteLocationError extends Error {
  constructor() {
    super("location is missing coordinates or timezone");
    this.name = "IncompleteLocationError";
  }
}

type ComputableLocation = LocationData & {
  latitude: number;
  longitude: number;
  timezone: string;
};

export function isComputable(loc: LocationData): loc is ComputableLocation {
  return (
    typeof loc.latitude === "number" &&
    typeof loc.longitude === "number" &&
    typeof loc.timezone === "string" &&
    loc.timezone.length > 0
  );
}

function calcParams(method: CalculationMethod, roundSeconds: boolean) {
  const factory =
    Adhan.CalculationMethod[method] ?? Adhan.CalculationMethod.MuslimWorldLeague;
  const params = factory();
  params.rounding = roundSeconds ? Adhan.Rounding.None : Adhan.Rounding.Nearest;
  return params;
}

// Computes the five prayers for one calendar day in the location timezone.
// `adjustments` shifts each prayer by a fixed number of minutes (the local
// mosque tune); it moves both the displayed clock and the absolute instant.
export function computePrayerDay(
  loc: LocationData,
  method: CalculationMethod,
  dateISO?: string,
  showSeconds = false,
  adjustments?: Partial<PrayerOffsets>,
): PrayerDay {
  if (!isComputable(loc)) throw new IncompleteLocationError();
  const tz = loc.timezone;
  const date = dateISO ?? DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");
  const [year, month, day] = date.split("-").map((n) => Number(n));
  if (!year || !month || !day) throw new Error(`bad date: ${date}`);

  // adhan reads only Y/M/D to pick the day; the instants it returns are absolute.
  const calendarDate = new Date(year, month - 1, day);
  const coords = new Adhan.Coordinates(loc.latitude, loc.longitude);
  const times = new Adhan.PrayerTimes(
    coords,
    calendarDate,
    calcParams(method, showSeconds),
  );
  // 12-hour wall-clock display, e.g. "5:42 PM".
  const fmt = showSeconds ? "h:mm:ss a" : "h:mm a";

  const prayers: ComputedPrayer[] = PRAYER_ORDER.map((name) => {
    const instant: Date = times[name];
    const offset = adjustments?.[name] ?? 0;
    const dt = DateTime.fromJSDate(instant).setZone(tz).plus({ minutes: offset });
    return {
      name,
      iso: dt.toISO() ?? new Date(instant.getTime() + offset * 60_000).toISOString(),
      clock: dt.toFormat(fmt),
    };
  });
  return { date, timezone: tz, prayers };
}
