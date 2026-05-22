import { describe, expect, it } from "vitest";
import { reshapeArabic, reshapeArabicVisual } from "../src/util/arabic.js";

describe("reshapeArabic", () => {
  it("leaves non-Arabic text unchanged", () => {
    expect(reshapeArabic("Maghrib 18:09 (33m)")).toBe("Maghrib 18:09 (33m)");
  });

  it("converts every Arabic letter to a presentation form", () => {
    const out = reshapeArabic("سبحان الله");
    const unshaped = [...out].some((ch) => {
      const c = ch.codePointAt(0)!;
      return c >= 0x0621 && c <= 0x064a;
    });
    expect(unshaped).toBe(false);
  });

  it("preserves logical order — the first letter stays first", () => {
    // seen (س) followed by beh → initial form U+FEB3 at index 0.
    expect(reshapeArabic("سبحان").codePointAt(0)).toBe(0xfeb3);
  });

  it("keeps digits in place and in order", () => {
    expect(reshapeArabic("الله أكبر ٣٤")).toContain("٣٤");
  });

  it("forms the lam-alef ligature", () => {
    const out = reshapeArabic("لا");
    expect([0xfefb, 0xfefc]).toContain(out.codePointAt(0));
    expect([...out]).toHaveLength(1);
  });
});

describe("reshapeArabicVisual", () => {
  it("leaves non-Arabic text unchanged", () => {
    expect(reshapeArabicVisual("0 / 33")).toBe("0 / 33");
  });

  it("shapes and reverses into visual RTL order", () => {
    // logical-order shaping reversed: the last logical letter renders first.
    const logical = [...reshapeArabic("سبحان الله")];
    expect([...reshapeArabicVisual("سبحان الله")]).toEqual(
      [...logical].reverse(),
    );
  });

  it("emits only connected presentation forms", () => {
    const out = reshapeArabicVisual("الله أكبر");
    expect(
      [...out].every((ch) => {
        const c = ch.codePointAt(0)!;
        return c === 0x20 || (c >= 0xfe70 && c <= 0xfefc);
      }),
    ).toBe(true);
  });
});
