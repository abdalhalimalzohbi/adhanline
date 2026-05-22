// Claude Code version detection — used to decide refreshInterval support.
import { execFileSync } from "node:child_process";

const MIN_REFRESH: readonly [number, number, number] = [2, 1, 97];

export function detectClaudeVersion(): [number, number, number] | null {
  try {
    const out = execFileSync("claude", ["--version"], {
      timeout: 4000,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const m = out.match(/(\d+)\.(\d+)\.(\d+)/);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
  } catch {
    return null;
  }
}

export function supportsRefreshInterval(
  version: [number, number, number] | null,
): boolean {
  if (!version) return false;
  for (let i = 0; i < 3; i++) {
    if (version[i]! > MIN_REFRESH[i]!) return true;
    if (version[i]! < MIN_REFRESH[i]!) return false;
  }
  return true;
}
