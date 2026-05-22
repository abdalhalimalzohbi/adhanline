// Leading icon, keyed by the next prayer.
import type { PrayerName } from "../types.js";

const ICONS: Record<PrayerName, string> = {
  fajr: "🌅",
  dhuhr: "☀️",
  asr: "🌤️",
  maghrib: "🌇",
  isha: "🌙",
};

export function leadingIcon(next: PrayerName): string {
  return ICONS[next];
}
