// Config schema, defaults, and tolerant normalization.
import type {
  Config,
  CountdownFormat,
  DhikrRotation,
  DividerName,
  ThemeName,
} from "../types.js";
import { CALCULATION_METHODS } from "../types.js";

export const CONFIG_VERSION = 1;

export const DEFAULT_CONFIG: Config = {
  version: CONFIG_VERSION,
  location: {
    source: "auto",
    city: null,
    country: null,
    timezone: null,
    latitude: null,
    longitude: null,
    confirmed: false,
  },
  calculation: { method: "MuslimWorldLeague" },
  display: {
    theme: "minimal",
    showHijri: true,
    showSeconds: false,
    countdownFormat: "paren",
    divider: "pipe",
    checkmark: true,
    adaptiveWidth: true,
    passiveTasbih: false,
  },
  urgency: { amberMinutes: 15, nowGraceMinutes: 25 },
  dhikr: {
    enabled: true,
    intervalMinutes: 10,
    windowSeconds: 90,
    rotation: "sequential",
    suppressWhenImminent: true,
  },
};

function oneOf<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function str(value: unknown, fallback: string | null): string | null {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function coord(value: unknown, fallback: number | null): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

// Deep-merges arbitrary input over the defaults and validates every field.
export function normalizeConfig(input: unknown): Config {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const get = (k: string) => (raw[k] ?? {}) as Record<string, unknown>;
  const loc = get("location");
  const calc = get("calculation");
  const disp = get("display");
  const urg = get("urgency");
  const dhk = get("dhikr");
  const d = DEFAULT_CONFIG;

  return {
    version: CONFIG_VERSION,
    location: {
      source: oneOf(loc.source, ["auto", "manual"] as const, d.location.source),
      city: str(loc.city, d.location.city),
      country: str(loc.country, d.location.country),
      timezone: str(loc.timezone, d.location.timezone),
      latitude: coord(loc.latitude, d.location.latitude),
      longitude: coord(loc.longitude, d.location.longitude),
      confirmed: bool(loc.confirmed, d.location.confirmed),
    },
    calculation: {
      method: oneOf(calc.method, CALCULATION_METHODS, d.calculation.method),
    },
    display: {
      theme: oneOf(disp.theme, ["minimal", "neon", "powerline"] as const satisfies readonly ThemeName[], d.display.theme),
      showHijri: bool(disp.showHijri, d.display.showHijri),
      showSeconds: bool(disp.showSeconds, d.display.showSeconds),
      countdownFormat: oneOf(
        disp.countdownFormat,
        ["paren", "in", "bare"] as const satisfies readonly CountdownFormat[],
        d.display.countdownFormat,
      ),
      divider: oneOf(
        disp.divider,
        ["pipe", "dot", "space"] as const satisfies readonly DividerName[],
        d.display.divider,
      ),
      checkmark: bool(disp.checkmark, d.display.checkmark),
      adaptiveWidth: bool(disp.adaptiveWidth, d.display.adaptiveWidth),
      passiveTasbih: bool(disp.passiveTasbih, d.display.passiveTasbih),
    },
    urgency: {
      amberMinutes: clamp(urg.amberMinutes, 1, 120, d.urgency.amberMinutes),
      nowGraceMinutes: clamp(urg.nowGraceMinutes, 1, 120, d.urgency.nowGraceMinutes),
    },
    dhikr: {
      enabled: bool(dhk.enabled, d.dhikr.enabled),
      intervalMinutes: clamp(dhk.intervalMinutes, 1, 180, d.dhikr.intervalMinutes),
      windowSeconds: clamp(dhk.windowSeconds, 60, 600, d.dhikr.windowSeconds),
      rotation: oneOf(
        dhk.rotation,
        ["sequential", "random"] as const satisfies readonly DhikrRotation[],
        d.dhikr.rotation,
      ),
      suppressWhenImminent: bool(dhk.suppressWhenImminent, d.dhikr.suppressWhenImminent),
    },
  };
}
