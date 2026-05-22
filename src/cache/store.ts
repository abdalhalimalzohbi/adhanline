// Cache store: atomic JSON files with a timestamped envelope for staleness.
import type { CacheEnvelope } from "../types.js";
import { cacheFile } from "../config/paths.js";
import { atomicWriteJson, readJsonOrNull } from "../util/fs.js";

export function writeCache<T>(name: string, data: T): void {
  const envelope: CacheEnvelope<T> = { savedAt: new Date().toISOString(), data };
  atomicWriteJson(cacheFile(name), envelope);
}

export function readCache<T>(name: string): CacheEnvelope<T> | null {
  const raw = readJsonOrNull<CacheEnvelope<T>>(cacheFile(name));
  if (!raw || typeof raw.savedAt !== "string" || !("data" in raw)) return null;
  return raw;
}

// A missing or undated envelope is always stale.
export function isStale(
  envelope: CacheEnvelope<unknown> | null,
  ttlMs: number,
): boolean {
  if (!envelope) return true;
  const saved = Date.parse(envelope.savedAt);
  return Number.isNaN(saved) || Date.now() - saved > ttlMs;
}
