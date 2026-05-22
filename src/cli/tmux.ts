// `tmux` — single-line render (the prayer strip only) for a tmux status
// segment. Same engine as the status line, one-line front-end.
import { stdout } from "node:process";
import { loadConfig } from "../config/load.js";
import { isComputable } from "../prayer/calculate.js";
import { buildLine1 } from "../status/line1-prayers.js";
import { CONFIG_NUDGE } from "../status/render.js";
import { buildState } from "../status/state.js";
import { resolveTheme } from "../status/theme.js";
import { classifyUrgency } from "../status/urgency.js";

export function runTmux(): void {
  let line: string;
  try {
    const config = loadConfig();
    if (!isComputable(config.location)) {
      line = CONFIG_NUDGE;
    } else {
      const state = buildState(config);
      line = buildLine1(state, resolveTheme(config.display.theme), classifyUrgency(state));
    }
  } catch {
    line = CONFIG_NUDGE;
  }
  stdout.write(`${line}\n`);
}
