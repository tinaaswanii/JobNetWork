// TEMPORARY diagnostic. Delete this file after the Artha connection is fixed.
// Sends NO API key. Reports the Vercel region, the host being called, and either the
// HTTP status (401 MISSING_API_KEY is the healthy answer here) or the real network error code.
import { NextResponse } from "next/server";
import { getArthaBaseUrl } from "@/lib/artha";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = getArthaBaseUrl();
  const host = new URL(base).host;
  const region = process.env.VERCEL_REGION ?? "unknown";
  try {
    const res = await fetch(`${base}/jobs?limit=1`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    return NextResponse.json({ ok: true, region, host, status: res.status });
  } catch (err) {
    const cause = (err as { cause?: { code?: unknown } } | null)?.cause;
    return NextResponse.json({
      ok: false,
      region,
      host,
      error: err instanceof Error ? err.message : "unknown",
      cause_code: typeof cause?.code === "string" ? cause.code : null,
    });
  }
}
