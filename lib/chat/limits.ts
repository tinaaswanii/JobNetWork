// Best-effort request limits for the public chat endpoint.
//
// State lives in this server instance's memory. On Vercel each warm instance has
// its own counters and they reset on cold start, so this stops casual abuse and
// runaway loops but is NOT a hard spending cap. Set a monthly spend limit in the
// Anthropic console for a real ceiling.

const WINDOW_MS = 10 * 60_000;
const PER_IP_LIMIT = Number(process.env.CHAT_RATE_LIMIT_PER_10_MIN) || 20;
const DAILY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT) || 1500;

const hits = new Map<string, number[]>();
let day = new Date().toISOString().slice(0, 10);
let dayCount = 0;

export function checkLimits(ip: string, now = Date.now()): { ok: true } | { ok: false; retryAfterSec: number } {
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== day) {
    day = today;
    dayCount = 0;
  }
  if (dayCount >= DAILY_LIMIT) return { ok: false, retryAfterSec: 3600 };

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= PER_IP_LIMIT) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000)) };
  }
  recent.push(now);
  hits.set(ip, recent);
  dayCount++;

  // Keep the map from growing without bound.
  if (hits.size > 5000) {
    hits.forEach((v, k) => {
      if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
    });
  }
  return { ok: true };
}
