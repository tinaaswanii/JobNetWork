import { fetchJobs, ArthaApiError, type PublicJob, type JobsQuery } from "@/lib/artha";
import { supabaseAdmin } from "@/lib/supabase";

export type JobsPageResult = {
  items: PublicJob[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
};

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
    console.error("[lib/jobs] supabase error", error);
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
    console.error("[lib/jobs] supabase count error", error);
    return 0;
  }
  return count ?? 0;
}

// Merges the Artha feed with your own_jobs table. Used by both
// app/api/jobs/route.ts (for client-side filtering/pagination) and
// app/page.tsx (for the initial server-rendered page, so real job content
// — not just a loading shell — is present in the HTML search engines see).
export async function getJobsPage(query: JobsQuery): Promise<JobsPageResult> {
  const [arthaResult, ownRows, ownTotal] = await Promise.all([
    fetchJobs(query),
    query.offset === 0 ? fetchOwnJobs(query) : Promise.resolve([]),
    fetchOwnJobsCount(query),
  ]);

  const ownAsJobs = ownRows.map(normalizeOwnJob);

  // Interleave own_jobs evenly through the Artha feed instead of sorting by
  // date and concatenating. A pure date-sort clusters all own_jobs into one
  // block at the top whenever they share a posted_date (e.g. right after a
  // bulk CSV import), which looks like "my jobs first, then everything
  // else" rather than a genuine mix — even though it's technically sorted.
  const merged: PublicJob[] = [];
  const artha = [...arthaResult.items];
  const own = [...ownAsJobs];
  // Roughly one of your own jobs per this many Artha jobs, so a handful of
  // own_jobs doesn't get diluted across a huge Artha page, and a large
  // own_jobs batch doesn't dominate a small Artha page either.
  const INTERVAL = own.length > 0 ? Math.max(1, Math.round(artha.length / own.length)) : Infinity;

  let arthaIdx = 0;
  while (arthaIdx < artha.length || own.length > 0) {
    for (let i = 0; i < INTERVAL && arthaIdx < artha.length; i++) {
      merged.push(artha[arthaIdx++]);
    }
    if (own.length > 0) {
      merged.push(own.shift()!);
    }
  }

  const combinedTotal = arthaResult.total + ownTotal;
  const hasMore = arthaResult.offset + arthaResult.limit < combinedTotal;

  return {
    items: merged,
    total: combinedTotal,
    limit: arthaResult.limit,
    offset: arthaResult.offset,
    has_more: hasMore,
  };
}

export { ArthaApiError };
