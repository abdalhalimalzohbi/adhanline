// Resolves which prayer is next, including the after-Isha rollover to
// tomorrow's Fajr. All comparisons are on absolute instants (DST-correct).
import { DateTime } from "luxon";
import type { ComputedPrayer, NextPrayerInfo, PrayerDay } from "../types.js";

const MS_PER_MINUTE = 60_000;

const instantMs = (p: ComputedPrayer) => DateTime.fromISO(p.iso).toMillis();

export function resolveNextPrayer(
  today: PrayerDay,
  prevIsha: ComputedPrayer,
  nextFajr: ComputedPrayer,
  now: DateTime,
): NextPrayerInfo {
  const nowMs = now.toMillis();

  // A prayer stays "next" through its own minute so the NOW state is visible
  // at the ~60s refresh cadence; minutesUntil then clamps to 0.
  let next = today.prayers.find((p) => instantMs(p) > nowMs - MS_PER_MINUTE);
  let tomorrow = false;
  if (!next) {
    next = nextFajr;
    tomorrow = true;
  }

  const passed = today.prayers
    .filter((p) => instantMs(p) <= nowMs)
    .map((p) => p.name);

  // Most recent prayer at/before now — drives line 2's grace window.
  // Includes yesterday's Isha so the window survives across midnight.
  let lastPassed: NextPrayerInfo["lastPassed"] = null;
  const earlier = [prevIsha, ...today.prayers].filter(
    (p) => instantMs(p) <= nowMs,
  );
  if (earlier.length > 0) {
    const recent = earlier.reduce((a, b) =>
      instantMs(a) >= instantMs(b) ? a : b,
    );
    lastPassed = {
      name: recent.name,
      minutesAgo: Math.floor((nowMs - instantMs(recent)) / MS_PER_MINUTE),
    };
  }

  return {
    name: next.name,
    iso: next.iso,
    clock: next.clock,
    minutesUntil: Math.max(
      0,
      Math.floor((instantMs(next) - nowMs) / MS_PER_MINUTE),
    ),
    tomorrow,
    passed,
    lastPassed,
  };
}
