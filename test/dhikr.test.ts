import { describe, expect, it } from "vitest";
import { dhikrWindow } from "../src/dhikr/window.js";
import type { DhikrConfig } from "../src/types.js";
import { at } from "./helpers.js";

const base: DhikrConfig = {
  enabled: true,
  intervalMinutes: 10,
  windowSeconds: 90,
  rotation: "sequential",
  suppressWhenImminent: true,
};

describe("dhikrWindow", () => {
  it("opens at an interval boundary", () => {
    expect(dhikrWindow(at("2026-05-22", "13:10"), base)).not.toBeNull();
  });

  it("is closed between boundaries", () => {
    expect(dhikrWindow(at("2026-05-22", "13:05"), base)).toBeNull();
  });

  it("closes after windowSeconds", () => {
    const open = at("2026-05-22", "13:10").plus({ seconds: 80 });
    const shut = at("2026-05-22", "13:10").plus({ seconds: 100 });
    expect(dhikrWindow(open, base)).not.toBeNull();
    expect(dhikrWindow(shut, base)).toBeNull();
  });

  it("sequential rotation advances each window", () => {
    const a = dhikrWindow(at("2026-05-22", "13:00"), base);
    const b = dhikrWindow(at("2026-05-22", "13:10"), base);
    expect(a).not.toBe(b);
  });

  it("random rotation is stable within one window", () => {
    const cfg: DhikrConfig = { ...base, rotation: "random" };
    const a = dhikrWindow(at("2026-05-22", "13:10").plus({ seconds: 5 }), cfg);
    const b = dhikrWindow(at("2026-05-22", "13:10").plus({ seconds: 60 }), cfg);
    expect(a).toBe(b);
  });
});
