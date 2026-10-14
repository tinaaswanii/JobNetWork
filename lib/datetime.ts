/** Timezone helpers with no dependencies (Intl only). Safe on server and client. */

export const TIMEZONES = [
  "Asia/Kolkata",
  "UTC",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
] as const;

export function isValidTimezone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Offset (ms) of `tz` from UTC at the instant `ts`. */
function offsetMs(ts: number, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ts));
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  const asUtc = Date.UTC(+m.year, +m.month - 1, +m.day, +m.hour, +m.minute, +m.second);
  return asUtc - Math.floor(ts / 1000) * 1000;
}

/** "2026-10-10T10:00" interpreted as wall-clock time in `tz` -> absolute Date. */
export function zonedToUtc(local: string, tz: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m || !isValidTimezone(tz)) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  if (Number.isNaN(guess)) return null;
  let utc = guess - offsetMs(guess, tz);
  const second = offsetMs(utc, tz);
  utc = guess - second; // second pass handles DST boundaries
  return new Date(utc);
}

/** Absolute instant -> "yyyy-MM-ddTHH:mm" wall-clock in `tz` (for <input type=datetime-local>). */
export function utcToZonedLocal(iso: string, tz: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(iso));
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  return `${m.year}-${m.month}-${m.day}T${m.hour}:${m.minute}`;
}

/** Display in the interview's own timezone, so server and client render identically. */
export function formatInZone(iso: string, tz: string) {
  const s = new Intl.DateTimeFormat("en-IN", {
    timeZone: tz,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
  return `${s} (${tz === "Asia/Kolkata" ? "IST" : tz})`;
}

/** Today's calendar date (yyyy-mm-dd) in India — the app's audience. */
export function todayIST() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}
