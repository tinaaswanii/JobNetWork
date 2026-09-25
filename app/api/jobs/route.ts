import { NextRequest, NextResponse } from "next/server";
import { type JobsQuery } from "@/lib/artha";
import { getJobsPage, ArthaApiError } from "@/lib/jobs";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const query: JobsQuery = {
    limit: sp.get("limit") ? Number(sp.get("limit")) : 10,
    offset: sp.get("offset") ? Number(sp.get("offset")) : 0,
    q: sp.get("q") ?? undefined,
    location: sp.get("location") ?? undefined,
    state: sp.get("state") ?? undefined,
    city: sp.get("city") ?? undefined,
    niche_keywords: sp.get("niche_keywords") ?? undefined,
    negative_keywords: sp.get("negative_keywords") ?? undefined,
    job_type: sp.get("job_type") ?? undefined,
    work_mode: sp.get("work_mode") ?? undefined,
    exp_level: sp.get("exp_level") ?? undefined,
    education: sp.get("education") ?? undefined,
    industry: sp.get("industry") ?? undefined,
    company: sp.get("company") ?? undefined,
    salary_min: sp.get("salary_min") ? Number(sp.get("salary_min")) : undefined,
    salary_max: sp.get("salary_max") ? Number(sp.get("salary_max")) : undefined,
    posted_after: sp.get("posted_after") ?? undefined,
    sort_by: (sp.get("sort_by") as JobsQuery["sort_by"]) ?? undefined,
  };

  try {
    const result = await getJobsPage(query);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ArthaApiError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
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
