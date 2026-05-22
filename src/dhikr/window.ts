// Stateless dhikr-window selection — a pure function of the clock.
// A window opens at each interval boundary and stays open for windowSeconds.
import type { DateTime } from "luxon";
import type { DhikrConfig } from "../types.js";
import { DHIKR_LIST } from "./list.js";

export function dhikrWindow(now: DateTime, config: DhikrConfig): string | null {
  const minuteOfDay = now.hour * 60 + now.minute;
  const secondOfDay = minuteOfDay * 60 + now.second;
  const index = Math.floor(minuteOfDay / config.intervalMinutes);
  const windowStart = index * config.intervalMinutes * 60;
  if (secondOfDay - windowStart >= config.windowSeconds) return null;

  const pick =
    config.rotation === "random"
      ? seeded(index, DHIKR_LIST.length)
      : index % DHIKR_LIST.length;
  return DHIKR_LIST[pick] ?? null;
}

// Deterministic per-window index so "random" is stable within one window.
function seeded(seed: number, len: number): number {
  let x = ((seed + 1) * 2654435761) >>> 0;
  x = (x ^ (x >>> 13)) >>> 0;
  return x % len;
}
