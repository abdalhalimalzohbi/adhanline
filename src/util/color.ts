// Minimal ANSI styling. Color is on unless NO_COLOR is set — the status line
// is piped to Claude Code (never a TTY) but still wants ANSI.

export const colorEnabled = !process.env.NO_COLOR;

export function paint(codes: readonly number[], text: string): string {
  if (!colorEnabled || codes.length === 0) return text;
  return `\x1b[${codes.join(";")}m${text}\x1b[0m`;
}
