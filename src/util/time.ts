// Countdown formatting for the prayer strip.
import type { CountdownFormat } from "../types.js";

// "33m" under an hour, "2h 14m" beyond.
export function formatCountdown(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  if (total < 60) return `${total}m`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function wrapCountdown(text: string, format: CountdownFormat): string {
  if (format === "in") return `in ${text}`;
  if (format === "bare") return text;
  return `(${text})`;
}
