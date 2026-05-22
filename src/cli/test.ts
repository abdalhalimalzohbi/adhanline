// `test` — preview the render at an arbitrary time/date/theme.
import { stdout } from "node:process";
import { DateTime } from "luxon";
import { loadConfig } from "../config/load.js";
import { isComputable } from "../prayer/calculate.js";
import { renderStatus } from "../status/render.js";
import type { ThemeName } from "../types.js";

export interface TestOptions {
  at?: string;
  date?: string;
  theme?: string;
}

const THEMES: readonly ThemeName[] = ["minimal", "neon", "powerline"];

export function runTest(options: TestOptions): void {
  const config = loadConfig();

  if (options.theme) {
    if (THEMES.includes(options.theme as ThemeName)) {
      config.display.theme = options.theme as ThemeName;
    } else {
      stdout.write(`Unknown theme "${options.theme}" — using ${config.display.theme}\n`);
    }
  }

  if (!isComputable(config.location)) {
    stdout.write(`${renderStatus(config)}\n`);
    return;
  }

  let now = DateTime.now().setZone(config.location.timezone);
  if (options.date) {
    const [y, m, d] = options.date.split("-").map((n) => Number(n));
    if (y && m && d) now = now.set({ year: y, month: m, day: d });
    else stdout.write(`Ignoring bad --date "${options.date}"\n`);
  }
  if (options.at) {
    const [h, min] = options.at.split(":").map((n) => Number(n));
    if (Number.isFinite(h) && Number.isFinite(min)) {
      now = now.set({ hour: h, minute: min, second: 0, millisecond: 0 });
    } else {
      stdout.write(`Ignoring bad --at "${options.at}"\n`);
    }
  }

  stdout.write(`(preview @ ${now.toFormat("yyyy-MM-dd HH:mm")} ${now.zoneName})\n`);
  stdout.write(`${renderStatus(config, now)}\n`);
}
