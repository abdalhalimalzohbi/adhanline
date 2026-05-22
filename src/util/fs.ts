// Atomic writes (temp file + rename) and tolerant reads.
import {
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

export function atomicWrite(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    writeFileSync(tmp, content, "utf8");
    renameSync(tmp, filePath);
  } catch (err) {
    try {
      unlinkSync(tmp);
    } catch {
      // temp file may not exist
    }
    throw err;
  }
}

export function atomicWriteJson(filePath: string, value: unknown): void {
  atomicWrite(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function readFileOrNull(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

export function readJsonOrNull<T = unknown>(filePath: string): T | null {
  const raw = readFileOrNull(filePath);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
