// Themes are SGR-code palettes keyed by role; render code applies them
// via paint(). NO_COLOR / non-color terminals degrade automatically.
import type { ThemeName } from "../types.js";

export type Role =
  | "date"
  | "passed"
  | "upcoming"
  | "calm"
  | "amber"
  | "now"
  | "countdown"
  | "divider"
  | "location"
  | "dhikr"
  | "grace";

export type Theme = Record<Role, readonly number[]>;

const minimal: Theme = {
  date: [2],
  passed: [2],
  upcoming: [],
  calm: [1],
  amber: [1, 33],
  now: [1, 31],
  countdown: [36],
  divider: [2],
  location: [2],
  dhikr: [32],
  grace: [2],
};

const neon: Theme = {
  date: [95],
  passed: [2, 90],
  upcoming: [96],
  calm: [1, 92],
  amber: [1, 93],
  now: [1, 41, 97],
  countdown: [1, 95],
  divider: [35],
  location: [96],
  dhikr: [92],
  grace: [95],
};

const powerline: Theme = {
  date: [100, 30],
  passed: [2],
  upcoming: [37],
  calm: [1, 44, 97],
  amber: [1, 43, 30],
  now: [1, 41, 97],
  countdown: [96],
  divider: [90],
  location: [90],
  dhikr: [32],
  grace: [90],
};

const THEMES: Record<ThemeName, Theme> = { minimal, neon, powerline };

export function resolveTheme(name: ThemeName): Theme {
  return THEMES[name] ?? minimal;
}
