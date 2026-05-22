// Location detection: provider fallback chain, first success wins.
import type { CacheMeta, LocationData, Provider } from "../types.js";
import { LOCATION_FILE, META_FILE } from "../cache/keys.js";
import { readCache, writeCache } from "../cache/store.js";
import { PROVIDERS } from "./providers.js";

export interface DetectionResult {
  location: LocationData;
  provider: Provider;
}

export async function detectLocation(
  timeoutMs = 2500,
): Promise<DetectionResult | null> {
  for (const provider of PROVIDERS) {
    try {
      return { location: await provider.detect(timeoutMs), provider: provider.id };
    } catch {
      // try the next provider
    }
  }
  return null;
}

// Detects and persists to cache (location.json + meta.json).
export async function detectAndCache(
  timeoutMs = 2500,
): Promise<DetectionResult | null> {
  const result = await detectLocation(timeoutMs);
  if (!result) return null;

  writeCache(LOCATION_FILE, result.location);
  const prev = readCache<CacheMeta>(META_FILE)?.data;
  writeCache<CacheMeta>(META_FILE, {
    provider: result.provider,
    lastDetect: new Date().toISOString(),
    locationDriftPending: prev?.locationDriftPending ?? false,
    pendingLocation: prev?.pendingLocation ?? null,
  });
  return result;
}
