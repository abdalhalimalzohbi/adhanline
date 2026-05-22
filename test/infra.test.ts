import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

process.env.XDG_CACHE_HOME = mkdtempSync(join(tmpdir(), "cps-cache-"));

const { isStale, readCache, writeCache } = await import("../src/cache/store.js");
const { formatCountdown, wrapCountdown } = await import("../src/util/time.js");
const { parseSession } = await import("../src/util/stdin.js");
const { runSafely, FALLBACK_LINE } = await import("../src/util/safe.js");
const { haversineKm, isSignificantDrift } = await import("../src/location/travel.js");
const { isNarrow } = await import("../src/util/width.js");

describe("time formatting", () => {
  it("formats minutes and hours", () => {
    expect(formatCountdown(33)).toBe("33m");
    expect(formatCountdown(134)).toBe("2h 14m");
    expect(formatCountdown(120)).toBe("2h");
    expect(formatCountdown(-5)).toBe("0m");
  });

  it("wraps per format", () => {
    expect(wrapCountdown("33m", "paren")).toBe("(33m)");
    expect(wrapCountdown("33m", "in")).toBe("in 33m");
    expect(wrapCountdown("33m", "bare")).toBe("33m");
  });
});

describe("parseSession", () => {
  it("tolerates empty, invalid, and valid JSON", () => {
    expect(parseSession("")).toEqual({});
    expect(parseSession("not json{{")).toEqual({});
    expect(parseSession("[1,2]")).toEqual({});
    expect(parseSession('{"session_id":"x"}')).toEqual({ session_id: "x" });
  });
});

describe("runSafely", () => {
  it("prints the fallback when the renderer throws", async () => {
    let out = "";
    const spy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(((s: string) => ((out += s), true)) as never);
    await runSafely(() => {
      throw new Error("boom");
    });
    spy.mockRestore();
    expect(out).toContain(FALLBACK_LINE);
    expect(process.exitCode).toBe(0);
  });

  it("prints the rendered output on success", async () => {
    let out = "";
    const spy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(((s: string) => ((out += s), true)) as never);
    await runSafely(() => "hello");
    spy.mockRestore();
    expect(out).toBe("hello\n");
  });
});

describe("cache store", () => {
  it("round-trips and detects staleness", () => {
    writeCache("probe.json", { value: 42 });
    const env = readCache<{ value: number }>("probe.json");
    expect(env?.data.value).toBe(42);
    expect(isStale(env, 60_000)).toBe(false);
    expect(isStale(env, -1)).toBe(true);
    expect(isStale(null, 60_000)).toBe(true);
  });

  it("last write wins under repeated writes", () => {
    for (let i = 0; i < 25; i++) writeCache("race.json", { i });
    expect(readCache<{ i: number }>("race.json")?.data.i).toBe(24);
  });
});

describe("travel drift", () => {
  it("measures distance and flags significant moves", () => {
    expect(haversineKm(-6.2, 106.8, -6.2, 106.8)).toBeLessThan(1);
    const jakarta = { city: "Jakarta", country: "ID", timezone: "", latitude: -6.2, longitude: 106.8 };
    const cairo = { city: "Cairo", country: "EG", timezone: "", latitude: 30, longitude: 31.2 };
    expect(isSignificantDrift(jakarta, cairo)).toBe(true);
    expect(isSignificantDrift(jakarta, { ...jakarta })).toBe(false);
  });
});

describe("isNarrow", () => {
  it("collapses only when the width is known and small", () => {
    expect(isNarrow(50)).toBe(true);
    expect(isNarrow(120)).toBe(false);
    expect(isNarrow(null)).toBe(false);
  });
});
