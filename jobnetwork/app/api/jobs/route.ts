import { NextRequest, NextResponse } from "next/server";
import { fetchJobs, ArthaApiError, type PublicJob, type JobsQuery } from "@/lib/artha";
import { supabaseAdmin } from "@/lib/supabase";

// Turn one of your own_jobs rows into the same shape as artha.link's PublicJob,
// so the frontend renders both feeds with one component.
function normalizeOwnJob(row: any): PublicJob {
  return {
    id: `own_${row.id}`,
    slug: row.id,
    title: row.title,
    company: row.company,
    logo: row.logo,
    description: row.description,
    location: row.location,
    city: row.city,
    state: row.state,
    country: row.country,
    job_type: row.job_type,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    salary_curr: row.salary_curr,
    exp_min: null,
    exp_max: null,
    exp_unit: null,
    skills: row.skills ?? [],
    posted_date: row.posted_date,
    url: row.apply_url, // your own listings link straight to your own apply URL
  };
}

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
    const [arthaResult, ownRows] = await Promise.all([
      fetchJobs(query),
      // Only pull your own jobs on the first page so they don't repeat on every page —
      // simplest correct approach for a small self-added-jobs table.
      query.offset === 0 ? fetchOwnJobs(query) : Promise.resolve([]),
    ]);

    const merged = [...ownRows.map(normalizeOwnJob), ...arthaResult.items];

    return NextResponse.json({
      success: true,
      data: {
        items: merged,
        total: arthaResult.total + ownRows.length,
        limit: arthaResult.limit,
        offset: arthaResult.offset,
        has_more: arthaResult.has_more,
      },
    });
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

async function fetchOwnJobs(query: JobsQuery) {
  const db = supabaseAdmin();
  let q = db.from("own_jobs").select("*").eq("is_active", true);

  if (query.q) q = q.ilike("title", `%${query.q}%`);
  if (query.location) q = q.eq("country", query.location);
  if (query.job_type) q = q.eq("job_type", query.job_type);
  if (query.work_mode) q = q.eq("work_mode", query.work_mode);
  if (query.company) q = q.ilike("company", `%${query.company}%`);

  const { data, error } = await q.order("posted_date", { ascending: false }).limit(3);
  if (error) {
    console.error("[api/jobs] supabase error", error);
    return [];
  }
  return data ?? [];
}
