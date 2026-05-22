import { DateTime } from "luxon";
import { PRAYER_ORDER } from "../src/types.js";
import type { LocationConfig, PrayerDay, PrayerName } from "../src/types.js";

export const JAKARTA: LocationConfig = {
  source: "manual",
  city: "Bekasi",
  country: "Indonesia",
  timezone: "Asia/Jakarta",
  latitude: -6.2349,
  longitude: 106.9896,
  confirmed: true,
};

// Builds a PrayerDay from "HH:mm" wall-clock times in Asia/Jakarta (+07:00).
export function mkDay(
  date: string,
  times: Record<PrayerName, string>,
): PrayerDay {
  return {
    date,
    timezone: "Asia/Jakarta",
    prayers: PRAYER_ORDER.map((name) => ({
      name,
      iso: DateTime.fromISO(`${date}T${times[name]}:00+07:00`).toISO()!,
      clock: times[name],
    })),
  };
}

export function at(date: string, hhmm: string): DateTime {
  return DateTime.fromISO(`${date}T${hhmm}:00+07:00`);
}
