// First-run location confirmation. IP geolocation can be wrong (VPN, mobile);
// the user confirms or corrects it once.
import { stdout } from "node:process";
import type { LocationConfig, LocationData } from "../types.js";
import { ask, confirm } from "../util/prompt.js";

export async function promptManualLocation(
  defaults?: Partial<LocationData>,
): Promise<LocationConfig> {
  stdout.write("\nEnter your location manually:\n");
  const city = await ask("  City", defaults?.city ?? "");
  const country = await ask("  Country", defaults?.country ?? "");
  const timezone = await ask("  IANA timezone (e.g. Asia/Beirut)", defaults?.timezone ?? "");
  const latRaw = await ask("  Latitude", defaults?.latitude?.toString() ?? "");
  const lngRaw = await ask("  Longitude", defaults?.longitude?.toString() ?? "");
  const lat = Number(latRaw);
  const lng = Number(lngRaw);

  return {
    source: "manual",
    city: city || null,
    country: country || null,
    timezone: timezone || null,
    latitude: latRaw && Number.isFinite(lat) ? lat : null,
    longitude: lngRaw && Number.isFinite(lng) ? lng : null,
    confirmed: true,
  };
}

export async function confirmDetectedLocation(
  detected: LocationData,
): Promise<LocationConfig> {
  const where = [detected.city, detected.country].filter(Boolean).join(", ");
  stdout.write(`\nDetected location: ${where || "unknown"}\n`);
  stdout.write(
    `  timezone ${detected.timezone ?? "?"} · ${detected.latitude ?? "?"}, ${detected.longitude ?? "?"}\n`,
  );

  if (await confirm("Is this correct?", true)) {
    return { ...detected, source: "auto", confirmed: true };
  }
  return promptManualLocation(detected);
}
