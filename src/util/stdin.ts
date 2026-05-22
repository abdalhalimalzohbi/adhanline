// Tolerant stdin reader for the Claude Code session JSON.

export interface SessionInput {
  session_id?: string;
  [key: string]: unknown;
}

// Reads stdin fully; "" for a TTY or if the stream never ends in time.
export async function readStdin(timeoutMs = 250): Promise<string> {
  if (process.stdin.isTTY) return "";
  return new Promise<string>((resolve) => {
    let data = "";
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(data);
    };
    const timer = setTimeout(finish, timeoutMs);
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk: string) => {
      data += chunk;
    });
    process.stdin.on("end", finish);
    process.stdin.on("error", finish);
  });
}

export function parseSession(raw: string): SessionInput {
  if (!raw.trim()) return {};
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as SessionInput)
      : {};
  } catch {
    return {};
  }
}
