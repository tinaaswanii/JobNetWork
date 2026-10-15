/**
 * Artha job `url`s are signed redirect links (r.artha.link/redirect/...&expires=<unix seconds>&signature=...).
 * They stop working after `expires`. Pure helper: safe to import from server AND client components.
 * Non-Artha URLs (e.g. own-job apply URLs) have no `expires` param and are never treated as expired.
 */
export function isArthaUrlExpired(url: string | null | undefined, nowMs: number = Date.now()): boolean {
  if (!url) return false;
  try {
    const raw = new URL(url).searchParams.get("expires");
    if (raw === null) return false;
    const exp = Number(raw);
    return Number.isFinite(exp) && exp > 0 && exp * 1000 <= nowMs;
  } catch {
    return false;
  }
}
