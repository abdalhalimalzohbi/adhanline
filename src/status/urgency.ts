// Urgency tier from minutes-to-next. The post-prayer state is line 2's grace
// window, not here — line 1's NOW only marks an imminent prayer.
import type { UrgencyTier } from "../types.js";
import type { RenderState } from "./state.js";

export function classifyUrgency(state: RenderState): UrgencyTier {
  const minutes = state.next.minutesUntil;
  if (minutes <= 0) return "now";
  if (minutes <= state.config.urgency.amberMinutes) return "amber";
  return "calm";
}
