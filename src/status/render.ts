// Two-line status render — composition root.
import type { DateTime } from "luxon";
import type { Config } from "../types.js";
import { isComputable } from "../prayer/calculate.js";
import { buildLine1 } from "./line1-prayers.js";
import { buildLine2 } from "./line2-living.js";
import { buildState } from "./state.js";
import { resolveTheme } from "./theme.js";
import { classifyUrgency } from "./urgency.js";

export const CONFIG_NUDGE = "🕌 run: claude-prayer-status config";

export function renderStatus(config: Config, now?: DateTime): string {
  if (!isComputable(config.location)) return CONFIG_NUDGE;

  const state = buildState(config, now);
  const theme = resolveTheme(config.display.theme);
  const tier = classifyUrgency(state);
  return `${buildLine1(state, theme, tier)}\n${buildLine2(state, theme, tier)}`;
}
