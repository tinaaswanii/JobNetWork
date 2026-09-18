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
    const [arthaResult, ownRows, ownTotal] = await Promise.all([
      fetchJobs(query),
      // Only pull your own jobs on the first page so they don't repeat on every page —
      // simplest correct approach for a small self-added-jobs table.
      query.offset === 0 ? fetchOwnJobs(query) : Promise.resolve([]),
      // But always get the REAL matching count (regardless of page), so pagination
      // math (`total`, `has_more`, "Page X of Y") stays correct on every page —
      // not just page 1, where it used to accidentally work because ownRows.length
      // happened to equal the count.
      fetchOwnJobsCount(query),
    ]);

    const ownAsJobs = ownRows.map(normalizeOwnJob);
    const sortBy = query.sort_by ?? "newest";

    let merged: PublicJob[];
    if (sortBy === "newest") {
      merged = [...ownAsJobs, ...arthaResult.items].sort(
        (a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()
      );
    } else {
      // For relevance/priority sorting, artha.link's own ranking should show first;
      // your manually-added jobs go at the end instead of always leading.
      merged = [...arthaResult.items, ...ownAsJobs];
    }

    const combinedTotal = arthaResult.total + ownTotal;
    const hasMore = arthaResult.offset + arthaResult.limit < combinedTotal;

    return NextResponse.json({
      success: true,
      data: {
        items: merged,
        total: combinedTotal,
        limit: arthaResult.limit,
        offset: arthaResult.offset,
        has_more: hasMore,
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

// Typed as `any` deliberately: lib/supabase.ts's createClient() isn't given a
// Database generic, so the .from()/.select() chain has no concrete row type to
// narrow to here, and the two callers below apply .select() differently
// (one for rows, one for a count-only head request), so they don't share an
// exact builder type anyway.
function applyOwnJobFilters(q: any, query: JobsQuery) {
  let scoped = q;
if (query.q) {
  const search = query.q.trim();

  scoped = scoped.or(
    `title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%,country.ilike.%${search}%`
  );
}
  if (query.location) scoped = scoped.eq("country", query.location);
  if (query.job_type) scoped = scoped.eq("job_type", query.job_type);
  if (query.work_mode) scoped = scoped.eq("work_mode", query.work_mode);
  if (query.company) scoped = scoped.ilike("company", `%${query.company}%`);
  return scoped;
}

async function fetchOwnJobs(query: JobsQuery) {
  const db = supabaseAdmin();
  const q = applyOwnJobFilters(db.from("own_jobs").select("*").eq("is_active", true), query);

  const { data, error } = await q.order("posted_date", { ascending: false }).limit(20);
  if (error) {
    console.error("[api/jobs] supabase error", error);
    return [];
  }
  return data ?? [];
}

async function fetchOwnJobsCount(query: JobsQuery) {
  const db = supabaseAdmin();
  const q = applyOwnJobFilters(
    db.from("own_jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
    query
  );

  const { count, error } = await q;
  if (error) {
    console.error("[api/jobs] supabase count error", error);
    return 0;
  }
  return count ?? 0;
}
