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
  const isSearching = Boolean(query.q && query.q.trim());

  // Artha's own search is fuzzy against its ~500K+ job pool — a query like
  // "corporate" can match loads of jobs that only mention the word deep in
  // a description, not the job itself. When searching, ask Artha for a
  // bigger pool up front so there's enough left over after we filter that
  // pool down to genuine title/company matches below.
  const arthaQuery: JobsQuery = isSearching
    ? { ...query, limit: Math.max(query.limit ?? 10, 100) }
    : query;

  const [arthaResult, ownRows, ownTotal] = await Promise.all([
    fetchJobs(arthaQuery),
    query.offset === 0 ? fetchOwnJobs(query) : Promise.resolve([]),
    fetchOwnJobsCount(query),
  ]);

  const ownAsJobs = ownRows.map(normalizeOwnJob);

  // Strict search: only keep Artha results whose title or company actually
  // contains every word that was searched for, rather than trusting
  // whatever loosely-relevant set Artha's own fuzzy matching returned.
  let arthaItems = arthaResult.items;
  if (isSearching) {
    const terms = query.q!.trim().toLowerCase().split(/\s+/).filter(Boolean);
    arthaItems = arthaItems.filter((job) => {
      const haystack = `${job.title} ${job.company}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }

  const merged: PublicJob[] = [];
  const artha = [...arthaItems];
  const own = [...ownAsJobs];

  if (isSearching) {
    // When actively searching, a matching own_job is a curated, specific
    // match to what was typed — it should lead the results, not get buried
    // behind Artha's much larger (and often only loosely related) result
    // set. E.g. searching "Kalp Corporate" with 1 own_job match against 50
    // generic Artha matches for the word "corporate" should show Kalp
    // first, not last.
    merged.push(...own, ...artha);
  } else {
    // General browse, no search term: interleave own_jobs evenly through
    // the Artha feed instead of sorting by date and concatenating. A pure
    // date-sort clusters all own_jobs into one block at the top whenever
    // they share a posted_date (e.g. right after a bulk CSV import), which
    // looks like "my jobs first, then everything else" rather than a
    // genuine mix — even though it's technically sorted.
    // Roughly one of your own jobs per this many Artha jobs, so a handful
    // of own_jobs doesn't get diluted across a huge Artha page, and a large
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
  }

  // Once we've strictly filtered, Artha's own reported `total` no longer
  // matches what's actually on screen — it still reflects their fuzzy
  // match count. Use the real filtered count instead when searching, and
  // treat the page as complete (no further pagination) since a strict
  // title/company match set is typically small enough to fit on one page.
  const combinedTotal = isSearching ? merged.length : arthaResult.total + ownTotal;

  const hasMore = isSearching ? false : arthaResult.offset + arthaResult.limit < combinedTotal;

  return {
    items: merged,
    total: combinedTotal,
    limit: arthaResult.limit,
    offset: arthaResult.offset,
    has_more: hasMore,
  };
}

export { ArthaApiError };
