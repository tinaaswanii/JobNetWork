import { fetchJobs, ArthaApiError, type PublicJob, type JobsQuery, type JobsResponse } from "@/lib/artha";
import { supabaseAdmin } from "@/lib/supabase";
import { cacheArthaJobsInBackground, fetchCachedJobs } from "@/lib/job-cache";

export type JobsPageResult = JobsResponse & {
  sources: { artha: "live" | "cached" | "unavailable" };
};

// Normalize a manually posted row into the same shape as an Artha listing.
function normalizeOwnJob(row: any): PublicJob {
  return {
    id: `own_${row.id}`,
    slug: row.id,
    title: row.title,
    company: row.company,
    logo: row.logo ?? null,
    description: row.description ?? "",
    location: row.location ?? null,
    city: row.city ?? null,
    state: row.state ?? null,
    country: row.country ?? null,
    job_type: row.job_type ?? null,
    salary_min: row.salary_min ?? null,
    salary_max: row.salary_max ?? null,
    salary_curr: row.salary_curr ?? null,
    exp_min: null,
    exp_max: null,
    exp_unit: null,
    skills: row.skills ?? [],
    posted_date: row.posted_date ?? new Date(0).toISOString(),
    url: row.apply_url,
  };
}

function applyOwnJobFilters(q: any, query: JobsQuery) {
  let scoped = q;
  if (query.q?.trim()) {
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

async function fetchOwnJobs(query: JobsQuery, limit: number, offset: number): Promise<PublicJob[]> {
  if (limit <= 0 || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  try {
    const db = supabaseAdmin();
    const q = applyOwnJobFilters(
      db.from("own_jobs").select("*").eq("is_active", true),
      query
    );
    const { data, error } = await q
      .order("posted_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[lib/jobs] own_jobs query failed:", error.message);
      return [];
    }
    return (data ?? []).map(normalizeOwnJob);
  } catch (err) {
    console.error("[lib/jobs] own_jobs query failed:", err);
    return [];
  }
}

async function fetchOwnJobsCount(query: JobsQuery): Promise<number> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return 0;
  }

  try {
    const db = supabaseAdmin();
    const q = applyOwnJobFilters(
      db.from("own_jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
      query
    );
    const { count, error } = await q;
    if (error) {
      console.error("[lib/jobs] own_jobs count failed:", error.message);
      return 0;
    }
    return count ?? 0;
  } catch (err) {
    console.error("[lib/jobs] own_jobs count failed:", err);
    return 0;
  }
}

async function fetchExternalJobs(query: JobsQuery): Promise<{
  result: JobsResponse;
  source: "live" | "cached" | "unavailable";
}> {
  try {
    const result = await fetchJobs(query);
    cacheArthaJobsInBackground(result.items);
    return { result, source: "live" };
  } catch (err) {
    const detail =
      err instanceof ArthaApiError
        ? `${err.code} (HTTP ${err.status})`
        : err instanceof Error
          ? err.message
          : "unknown upstream error";
    console.warn("[lib/jobs] Artha feed unavailable; trying cached listings:", detail);

    const result = await fetchCachedJobs(query);
    return {
      result,
      source: result.total > 0 ? "cached" : "unavailable",
    };
  }
}

/**
 * Returns one stable page from the combined feed.
 *
 * Own postings and external postings are paginated as one dataset: the own
 * postings occupy their counted positions in the combined list, and the
 * external offset advances only by the number of positions before the page
 * that belong to the external feed. This prevents duplicate/skipped Artha
 * listings when a page also contains manually posted jobs.
 */
export async function getJobsPage(query: JobsQuery = {}): Promise<JobsPageResult> {
  const limit = Math.min(100, Math.max(1, Math.floor(query.limit ?? 12)));
  const offset = Math.max(0, Math.floor(query.offset ?? 0));
  const normalized: JobsQuery = { ...query, limit, offset };
  const ownTotal = await fetchOwnJobsCount(normalized);
  const ownPageCount = offset < ownTotal ? Math.min(limit, ownTotal - offset) : 0;
  const ownRows = await fetchOwnJobs(normalized, ownPageCount, offset);
  const isSearching = Boolean(normalized.q?.trim());

  // Search results need a larger Artha pool so we can discard loose matches
  // whose search words appear only deep in a description. The result count is
  // the actual strict-match pool returned here, not Artha's broader fuzzy total.
  if (isSearching) {
    const external = await fetchExternalJobs({ ...normalized, limit: 100, offset: 0 });
    const terms = normalized.q!.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const strictMatches = external.result.items.filter((job) => {
      const haystack = `${job.title} ${job.company}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });

    const externalStart = Math.max(0, offset - ownTotal);
    const externalSlots = Math.max(0, limit - ownRows.length);
    const externalItems = strictMatches.slice(externalStart, externalStart + externalSlots);
    const items = [...ownRows, ...externalItems];
    const total = ownTotal + strictMatches.length;

    return {
      items,
      total,
      limit,
      offset,
      has_more: offset + limit < total,
      sources: { artha: external.source },
    };
  }

  const externalOffset = Math.max(0, offset - ownTotal);
  const externalSlots = Math.max(0, limit - ownRows.length);
  // Even when a page is completely filled by own postings, request one
  // external row to obtain Artha's authoritative total for stable pagination.
  const external = await fetchExternalJobs({
    ...normalized,
    limit: Math.max(1, externalSlots),
    offset: externalOffset,
  });
  const externalItems = externalSlots > 0
    ? external.result.items.slice(0, externalSlots)
    : [];
  const items = [...ownRows, ...externalItems];
  const total = ownTotal + external.result.total;

  return {
    items,
    total,
    limit,
    offset,
    has_more: offset + limit < total,
    sources: { artha: external.source },
  };
}

export { ArthaApiError };
