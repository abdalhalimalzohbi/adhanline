// Universal error boundary — any failure becomes a safe fallback line,
// exit 0, never a stack trace in the user's terminal.

export const FALLBACK_LINE = "🕌 prayer times unavailable";

export async function runSafely(
  render: () => string | Promise<string>,
): Promise<void> {
  let output: string;
  try {
    output = await render();
    if (typeof output !== "string" || output.length === 0) {
      output = FALLBACK_LINE;
    }
  } catch {
    output = FALLBACK_LINE;
  }
  try {
    process.stdout.write(output.endsWith("\n") ? output : `${output}\n`);
  } catch {
    // stdout itself failed — nothing safe left to do.
  }
  process.exitCode = 0;
}
