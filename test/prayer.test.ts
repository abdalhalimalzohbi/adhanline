import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { computePrayerDay } from "../src/prayer/calculate.js";
import { hijriDate } from "../src/prayer/hijri.js";
import { resolveNextPrayer } from "../src/prayer/next-prayer.js";
import { JAKARTA, at, mkDay } from "./helpers.js";

const TIMES = {
  fajr: "04:41",
  dhuhr: "11:50",
  asr: "15:11",
  maghrib: "17:43",
  isha: "18:52",
};
const day = mkDay("2026-05-22", TIMES);
const prevIsha = mkDay("2026-05-21", TIMES).prayers[4]!;
const nextFajr = mkDay("2026-05-23", TIMES).prayers[0]!;

describe("computePrayerDay", () => {
  it("returns five prayers in canonical order", () => {
    const d = computePrayerDay(JAKARTA, "MuslimWorldLeague", "2026-05-22");
    expect(d.prayers.map((p) => p.name)).toEqual([
      "fajr",
      "dhuhr",
      "asr",
      "maghrib",
      "isha",
    ]);
  });

  it("times are strictly ascending and in the location timezone", () => {
    const d = computePrayerDay(JAKARTA, "MuslimWorldLeague", "2026-05-22");
    const ms = d.prayers.map((p) => DateTime.fromISO(p.iso).toMillis());
    expect(ms).toEqual([...ms].sort((a, b) => a - b));
    expect(d.prayers[0]!.iso).toContain("+07:00");
    expect(d.prayers[0]!.clock).toMatch(/^\d{2}:\d{2}$/);
  });

  it("showSeconds yields HH:mm:ss", () => {
    const d = computePrayerDay(JAKARTA, "MuslimWorldLeague", "2026-05-22", true);
    expect(d.prayers[0]!.clock).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it("stays correct around a DST transition", () => {
    const ny = { ...JAKARTA, timezone: "America/New_York" };
    const d = computePrayerDay(ny, "NorthAmerica", "2026-03-08");
    expect(d.prayers).toHaveLength(5);
    const ms = d.prayers.map((p) => DateTime.fromISO(p.iso).toMillis());
    expect(ms).toEqual([...ms].sort((a, b) => a - b));
  });
});

describe("resolveNextPrayer", () => {
  it("picks the first upcoming prayer", () => {
    const n = resolveNextPrayer(day, prevIsha, nextFajr, at("2026-05-22", "13:00"));
    expect(n.name).toBe("asr");
    expect(n.tomorrow).toBe(false);
    expect(n.passed).toEqual(["fajr", "dhuhr"]);
  });

  it("rolls over to tomorrow's Fajr after Isha", () => {
    const n = resolveNextPrayer(day, prevIsha, nextFajr, at("2026-05-22", "22:00"));
    expect(n.name).toBe("fajr");
    expect(n.tomorrow).toBe(true);
    expect(n.minutesUntil).toBeGreaterThan(0);
  });

  it("treats the prayer minute as NOW (minutesUntil 0)", () => {
    const n = resolveNextPrayer(day, prevIsha, nextFajr, at("2026-05-22", "17:43"));
    expect(n.name).toBe("maghrib");
    expect(n.minutesUntil).toBe(0);
  });

  it("reports the most recent prayer for the grace window", () => {
    const n = resolveNextPrayer(day, prevIsha, nextFajr, at("2026-05-22", "11:58"));
    expect(n.lastPassed?.name).toBe("dhuhr");
    expect(n.lastPassed?.minutesAgo).toBe(8);
  });

  it("uses yesterday's Isha before dawn", () => {
    const n = resolveNextPrayer(day, prevIsha, nextFajr, at("2026-05-22", "02:00"));
    expect(n.name).toBe("fajr");
    expect(n.lastPassed?.name).toBe("isha");
  });
});

describe("hijriDate", () => {
  it("formats as 'Day Month Year'", () => {
    const s = hijriDate(new Date("2026-05-22T05:00:00Z"), "Asia/Jakarta");
    expect(s).toMatch(/^\d{1,2}\s+\S.*\s+\d{4}$/);
  });

  it("returns '' for a bad timezone", () => {
    expect(hijriDate(new Date(), "Not/AZone")).toBe("");
  });
});
