// Travel / location-drift detection. A significantly different detection is
// flagged for re-confirmation, not silently adopted.
import type { CacheMeta, LocationData } from "../types.js";
import { META_FILE } from "../cache/keys.js";
import { readCache, writeCache } from "../cache/store.js";

export const DRIFT_THRESHOLD_KM = 100;

export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function isSignificantDrift(
  confirmed: LocationData,
  fresh: LocationData,
): boolean {
  if (confirmed.country && fresh.country && confirmed.country !== fresh.country) {
    return true;
  }
  if (
    typeof confirmed.latitude === "number" &&
    typeof confirmed.longitude === "number" &&
    typeof fresh.latitude === "number" &&
    typeof fresh.longitude === "number"
  ) {
    return (
      haversineKm(
        confirmed.latitude,
        confirmed.longitude,
        fresh.latitude,
        fresh.longitude,
      ) > DRIFT_THRESHOLD_KM
    );
  }
  return Boolean(confirmed.city && fresh.city && confirmed.city !== fresh.city);
}

function writeMeta(patch: Partial<CacheMeta>): void {
  const prev = readCache<CacheMeta>(META_FILE)?.data;
  writeCache<CacheMeta>(META_FILE, {
    provider: prev?.provider ?? null,
    lastDetect: prev?.lastDetect ?? null,
    locationDriftPending: false,
    pendingLocation: null,
    ...patch,
  });
}

export function evaluateDrift(
  confirmed: LocationData,
  fresh: LocationData,
): boolean {
  const drift = isSignificantDrift(confirmed, fresh);
  writeMeta({
    locationDriftPending: drift,
    pendingLocation: drift ? fresh : null,
  });
  return drift;
}

export function clearDrift(): void {
  writeMeta({ locationDriftPending: false, pendingLocation: null });
}
