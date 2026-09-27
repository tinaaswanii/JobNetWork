import { NextRequest, NextResponse } from "next/server";
import { fetchJobs, ArthaApiError, type PublicJob, type JobsQuery } from "@/lib/artha";
import { supabaseAdmin } from "@/lib/supabase";

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
    url: row.apply_url,
  };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const limit = sp.get("limit") ? Number(sp.get("limit")) : 10;
  const offset = sp.get("offset") ? Number(sp.get("offset")) : 0;
  const sortBy = (sp.get("sort_by") as JobsQuery["sort_by"]) ?? "newest";

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
    sort_by: sortBy,
  };

  try {
    const ownAll = (await fetchOwnJobs(query)).map(normalizeOwnJob);
    const ownTotal = ownAll.length;

    let items: PublicJob[];
    let arthaTotal: number;

    if (sortBy === "newest") {
      if (offset < ownTotal) {
        const ownSlice = ownAll.slice(offset, offset + limit);
        const remaining = limit - ownSlice.length;
        if (remaining > 0) {
          const arthaResult = await fetchJobs({ ...query, offset: 0, limit: remaining });
          items = [...ownSlice, ...arthaResult.items];
          arthaTotal = arthaResult.total;
        } else {
          items = ownSlice;
          const arthaResult = await fetchJobs({ ...query, offset: 0, limit: 1 });
          arthaTotal = arthaResult.total;
        }
      } else {
        const arthaOffset = offset - ownTotal;
        const arthaResult = await fetchJobs({ ...query, offset: arthaOffset, limit });
        items = arthaResult.items;
        arthaTotal = arthaResult.total;
      }
    } else {
      const arthaResult = await fetchJobs({ ...query, offset, limit });
      arthaTotal = arthaResult.total;

      if (arthaResult.items.length === limit) {
        items = arthaResult.items;
      } else if (offset < arthaTotal) {
        const remaining = limit - arthaResult.items.length;
        items = [...arthaResult.items, ...ownAll.slice(0, remaining)];
      } else {
        const ownOffset = offset - arthaTotal;
        items = ownAll.slice(ownOffset, ownOffset + limit);
      }
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

  const { data, error } = await q.order("posted_date", { ascending: false, nullsFirst: false });
  if (error) {
    console.error("[api/jobs] supabase error", error);
    return [];
  }
  return data ?? [];
}
