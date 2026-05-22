import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, normalizeConfig } from "../src/config/schema.js";

describe("normalizeConfig", () => {
  it("returns defaults for empty/garbage input", () => {
    expect(normalizeConfig({})).toEqual(DEFAULT_CONFIG);
    expect(normalizeConfig(null)).toEqual(DEFAULT_CONFIG);
    expect(normalizeConfig("nonsense")).toEqual(DEFAULT_CONFIG);
  });

  it("deep-merges partial input over defaults", () => {
    const c = normalizeConfig({ display: { theme: "neon" } });
    expect(c.display.theme).toBe("neon");
    expect(c.display.checkmark).toBe(DEFAULT_CONFIG.display.checkmark);
    expect(c.dhikr).toEqual(DEFAULT_CONFIG.dhikr);
  });

  it("rejects invalid enum values", () => {
    const c = normalizeConfig({
      display: { theme: "rainbow", divider: "zigzag" },
      calculation: { method: "Astrolabe" },
    });
    expect(c.display.theme).toBe("minimal");
    expect(c.display.divider).toBe("pipe");
    expect(c.calculation.method).toBe("MuslimWorldLeague");
  });

  it("clamps out-of-range numbers", () => {
    const c = normalizeConfig({
      urgency: { amberMinutes: 9999, nowGraceMinutes: -5 },
      dhikr: { windowSeconds: 10 },
    });
    expect(c.urgency.amberMinutes).toBe(120);
    expect(c.urgency.nowGraceMinutes).toBe(1);
    expect(c.dhikr.windowSeconds).toBe(60);
  });

  it("does not share nested objects between results", () => {
    const a = normalizeConfig({});
    const b = normalizeConfig({});
    a.location.city = "Cairo";
    expect(b.location.city).toBeNull();
  });
});
