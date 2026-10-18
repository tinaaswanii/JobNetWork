import { NextRequest, NextResponse } from "next/server";
import { ArthaApiError, type JobsQuery } from "@/lib/artha";
import { getJobsPage } from "@/lib/jobs";
import { buildJobsQuery, filtersFromParams } from "@/lib/jobs-query";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  // The page's own filters (q, location, type, mode, experience, posted, role,
  // sort) go through the shared builder; the rest are plain passthroughs.
  const base = buildJobsQuery(
    filtersFromParams(sp),
    sp.get("offset") ? Number(sp.get("offset")) : 0,
    sp.get("limit") ? Number(sp.get("limit")) : 10
  );
  const query: JobsQuery = {
    ...base,
    state: sp.get("state") ?? undefined,
    city: sp.get("city") ?? undefined,
    niche_keywords: base.niche_keywords ?? sp.get("niche_keywords") ?? undefined,
    negative_keywords: sp.get("negative_keywords") ?? undefined,
    education: sp.get("education") ?? undefined,
    industry: sp.get("industry") ?? undefined,
    company: sp.get("company") ?? undefined,
    salary_min: sp.get("salary_min") ? Number(sp.get("salary_min")) : undefined,
    salary_max: sp.get("salary_max") ? Number(sp.get("salary_max")) : undefined,
    posted_after: base.posted_after ?? sp.get("posted_after") ?? undefined,
  };

  try {
    const result = await getJobsPage(query);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ArthaApiError) {
      console.warn(`[api/jobs] upstream ArthaApiError (${err.code}):`, err.message);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: err.code,
            message: "Job listings are temporarily unavailable. Please try again shortly.",
          },
        },
        { status: err.status }
      );
    }
    console.error("[api/jobs] unexpected error", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
      { status: 500 }
    );
  }
}
