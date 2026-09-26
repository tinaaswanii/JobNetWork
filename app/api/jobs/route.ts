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

  const limit = sp.get("limit") ? Number(sp.get("limit")) : 10;
  const offset = sp.get("offset") ? Number(sp.get("offset")) : 0;

  const query: JobsQuery = {
    limit,
    offset,
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
    // Pull EVERY matching own_jobs row (not capped at 20) so pagination across
    // your whole own-jobs list actually works, no matter how many you've added.
    const ownAll = (await fetchOwnJobs(query)).map(normalizeOwnJob);
    const ownTotal = ownAll.length;

    let items: PublicJob[];
    let arthaTotal: number;

    if (offset < ownTotal) {
      // This page starts inside your own-jobs list.
      const ownSlice = ownAll.slice(offset, offset + limit);
      const remaining = limit - ownSlice.length;

      if (remaining > 0) {
        // Own jobs ran out partway through this page — fill the rest from artha.link,
        // starting from ITS beginning (offset 0), since none of artha's jobs have
        // been shown yet at this point in the combined list.
        const arthaResult = await fetchJobs({ ...query, offset: 0, limit: remaining });
        items = [...ownSlice, ...arthaResult.items];
        arthaTotal = arthaResult.total;
      } else {
        items = ownSlice;
        // Still need artha's total count for correct pagination math, without
        // pulling a full page of jobs we won't show yet.
        const arthaResult = await fetchJobs({ ...query, offset: 0, limit: 1 });
        arthaTotal = arthaResult.total;
      }
    } else {
      // Past all own_jobs — this page comes entirely from artha.link.
      const arthaOffset = offset - ownTotal;
      const arthaResult = await fetchJobs({ ...query, offset: arthaOffset, limit });
      items = arthaResult.items;
      arthaTotal = arthaResult.total;
    }

    const total = ownTotal + arthaTotal;
    const has_more = offset + limit < total;

    return NextResponse.json({
      success: true,
      data: { items, total, limit, offset, has_more },
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

  // No .limit() here — we want every matching row so pagination across
  // your full own-jobs list works correctly.
  const { data, error } = await q.order("posted_date", { { ascending: false, nullsFirst: false });
  if (error) {
    console.error("[api/jobs] supabase error", error);
    return [];
  }
  return data ?? [];
}
