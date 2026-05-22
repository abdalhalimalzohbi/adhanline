// Line 1: the prayer strip — icon, Hijri date, then Fajr → Isha with the
// passed prayers dimmed and the next one highlighted with a countdown.
import type { DividerName, PrayerName, UrgencyTier } from "../types.js";
import { colorEnabled, paint } from "../util/color.js";
import { formatCountdown, wrapCountdown } from "../util/time.js";
import { isNarrow } from "../util/width.js";
import { leadingIcon } from "./icons.js";
import type { RenderState } from "./state.js";
import type { Theme } from "./theme.js";

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const DIVIDER_GLYPH: Record<DividerName, string> = {
  pipe: "│",
  dot: "·",
  space: " ",
};

function nextSegment(state: RenderState, theme: Theme, tier: UrgencyTier): string {
  const { next, config } = state;
  const label = PRAYER_LABELS[next.name];
  if (tier === "now") {
    return `🔴 ${paint(theme.now, `${label} NOW`)}`;
  }
  const role = tier === "amber" ? theme.amber : theme.calm;
  // Without color, amber still needs a marker so meaning survives.
  const mark = tier === "amber" && !colorEnabled ? " !" : "";
  const countdown = paint(
    theme.countdown,
    wrapCountdown(formatCountdown(next.minutesUntil), config.display.countdownFormat),
  );
  return `${paint(role, `${label} ${next.clock}`)}${mark} ${countdown}`;
}

export function buildLine1(state: RenderState, theme: Theme, tier: UrgencyTier): string {
  const { config, today, next } = state;
  const { display } = config;
  const icon = leadingIcon(next.name);

  if (display.adaptiveWidth && isNarrow()) {
    return `${icon} ${nextSegment(state, theme, tier)}`;
  }

  const glyph = DIVIDER_GLYPH[display.divider];
  const divider =
    display.divider === "space" ? "  " : ` ${paint(theme.divider, glyph)} `;

  const segments: string[] = [];
  if (display.showHijri && state.hijri) {
    segments.push(paint(theme.date, state.hijri));
  }

  for (const prayer of today.prayers) {
    if (prayer.name === next.name) {
      segments.push(nextSegment(state, theme, tier));
      continue;
    }
    const label = PRAYER_LABELS[prayer.name];
    if (next.passed.includes(prayer.name)) {
      const tick = display.checkmark ? " ✓" : "";
      segments.push(paint(theme.passed, `${label} ${prayer.clock}${tick}`));
    } else {
      segments.push(paint(theme.upcoming, `${label} ${prayer.clock}`));
    }
  }

  return `${icon} ${segments.join(divider)}`;
}
