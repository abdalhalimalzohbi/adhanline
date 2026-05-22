// Terminal width detection for adaptive density.

export const NARROW_THRESHOLD = 70;

export function terminalWidth(): number | null {
  const cols = process.stdout.columns;
  if (typeof cols === "number" && cols > 0) return cols;
  const env = Number(process.env.COLUMNS);
  return Number.isFinite(env) && env > 0 ? env : null;
}

// Unknown width is treated as normal — collapsing a wide line is worse.
export function isNarrow(width: number | null = terminalWidth()): boolean {
  return width !== null && width < NARROW_THRESHOLD;
}
