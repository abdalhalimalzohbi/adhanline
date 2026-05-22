// Hijri date via the built-in Intl islamic-umalqura calendar. "9 Rajab 1447".

export function hijriDate(instant: Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: timezone,
    }).formatToParts(instant);

    const pick = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? "";

    const day = pick("day");
    const month = pick("month");
    const year = pick("year");
    return day && month && year ? `${day} ${month} ${year}` : "";
  } catch {
    return "";
  }
}
