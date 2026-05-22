// Shared types. Dependency-free so any module can import it.

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export const PRAYER_ORDER: readonly PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

export interface LocationData {
  city: string | null;
  country: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface LocationConfig extends LocationData {
  source: "auto" | "manual";
  confirmed: boolean;
}

export type CalculationMethod =
  | "MuslimWorldLeague"
  | "Egyptian"
  | "Karachi"
  | "UmmAlQura"
  | "Dubai"
  | "MoonsightingCommittee"
  | "NorthAmerica"
  | "Kuwait"
  | "Qatar"
  | "Singapore"
  | "Tehran"
  | "Turkey";

export const CALCULATION_METHODS: readonly CalculationMethod[] = [
  "MuslimWorldLeague",
  "Egyptian",
  "Karachi",
  "UmmAlQura",
  "Dubai",
  "MoonsightingCommittee",
  "NorthAmerica",
  "Kuwait",
  "Qatar",
  "Singapore",
  "Tehran",
  "Turkey",
];

export type ThemeName = "minimal" | "neon" | "powerline";
export type CountdownFormat = "paren" | "in" | "bare";
export type DividerName = "pipe" | "dot" | "space";
export type DhikrRotation = "sequential" | "random";
export type UrgencyTier = "calm" | "amber" | "now";

export interface DisplayConfig {
  theme: ThemeName;
  showHijri: boolean;
  showSeconds: boolean;
  countdownFormat: CountdownFormat;
  divider: DividerName;
  checkmark: boolean;
  adaptiveWidth: boolean;
  passiveTasbih: boolean;
}

export interface DhikrConfig {
  enabled: boolean;
  intervalMinutes: number;
  windowSeconds: number;
  rotation: DhikrRotation;
  suppressWhenImminent: boolean;
}

export interface Config {
  version: number;
  location: LocationConfig;
  calculation: { method: CalculationMethod };
  display: DisplayConfig;
  urgency: { amberMinutes: number; nowGraceMinutes: number };
  dhikr: DhikrConfig;
}

export interface ComputedPrayer {
  name: PrayerName;
  iso: string;
  clock: string;
}

export interface PrayerDay {
  date: string;
  timezone: string;
  prayers: ComputedPrayer[];
}

export interface NextPrayerInfo {
  name: PrayerName;
  iso: string;
  clock: string;
  minutesUntil: number;
  tomorrow: boolean;
  passed: PrayerName[];
  lastPassed: { name: PrayerName; minutesAgo: number } | null;
}

export type Provider = "ip-api" | "ipinfo" | "ipapi";

export interface CacheMeta {
  provider: Provider | null;
  lastDetect: string | null;
  locationDriftPending: boolean;
  pendingLocation: LocationData | null;
}

export interface CacheEnvelope<T> {
  savedAt: string;
  data: T;
}
