// IP-geolocation provider adapters. Network is touched only here, on a
// cold/weekly cache — never on the warm hot path. Short timeouts throughout.
import type { LocationData, Provider } from "../types.js";

export interface ProviderAdapter {
  id: Provider;
  detect(timeoutMs: number): Promise<LocationData>;
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function num(value: unknown, field: string): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`missing/invalid ${field}`);
  }
  return n;
}

function str(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`missing/invalid ${field}`);
  }
  return value;
}

const ipApi: ProviderAdapter = {
  id: "ip-api",
  async detect(timeoutMs) {
    const r = (await fetchJson(
      "http://ip-api.com/json/?fields=status,country,city,lat,lon,timezone",
      timeoutMs,
    )) as Record<string, unknown>;
    if (r.status !== "success") throw new Error("ip-api: lookup failed");
    return {
      city: str(r.city, "city"),
      country: typeof r.country === "string" ? r.country : null,
      timezone: str(r.timezone, "timezone"),
      latitude: num(r.lat, "lat"),
      longitude: num(r.lon, "lon"),
    };
  },
};

const ipInfo: ProviderAdapter = {
  id: "ipinfo",
  async detect(timeoutMs) {
    const r = (await fetchJson("https://ipinfo.io/json", timeoutMs)) as Record<
      string,
      unknown
    >;
    const loc = str(r.loc, "loc").split(",");
    return {
      city: str(r.city, "city"),
      country: typeof r.country === "string" ? r.country : null,
      timezone: str(r.timezone, "timezone"),
      latitude: num(loc[0], "lat"),
      longitude: num(loc[1], "lng"),
    };
  },
};

const ipApiCo: ProviderAdapter = {
  id: "ipapi",
  async detect(timeoutMs) {
    const r = (await fetchJson("https://ipapi.co/json/", timeoutMs)) as Record<
      string,
      unknown
    >;
    if (r.error) throw new Error(`ipapi: ${String(r.reason ?? "error")}`);
    return {
      city: str(r.city, "city"),
      country: typeof r.country_name === "string" ? r.country_name : null,
      timezone: str(r.timezone, "timezone"),
      latitude: num(r.latitude, "latitude"),
      longitude: num(r.longitude, "longitude"),
    };
  },
};

export const PROVIDERS: readonly ProviderAdapter[] = [ipApi, ipInfo, ipApiCo];
