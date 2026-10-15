import { fetchJobs, ArthaApiError, type PublicJob, type JobsQuery, type JobsResponse } from "@/lib/artha";
import { supabaseAdmin } from "@/lib/supabase";
import { cacheArthaJobsInBackground, fetchCachedJobs } from "@/lib/job-cache";

export type JobsPageResult = JobsResponse & {
  sources: { artha: "live" | "cached" | "unavailable" };
};

function normalizeOwnJob(row: any): PublicJob {
  return {
    id: `own_${row.id}`, slug: row.id, title: row.title, company: row.company,
    logo: row.logo ?? null, description: row.description ?? "",
    location: row.location ?? null, city: row.city ?? null, state: row.state ?? null,
    country: row.country ?? null, job_type: row.job_type ?? null,
    salary_min: row.salary_min ?? null, salary_max: row.salary_max ?? null,
    salary_curr: row.salary_curr ?? null, exp_min: null, exp_max: null, exp_unit: null,
    skills: row.skills ?? [], posted_date: row.posted_date ?? new Date(0).toISOString(),
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
  if (query.location) scoped = scoped.or(`country.ilike.%${query.location}%,location.ilike.%${query.location}%`);
  if (query.job_type) scoped = scoped.eq("job_type", query.job_type);
  if (query.work_mode) scoped = scoped.eq("work_mode", query.work_mode);
  if (query.company) scoped = scoped.ilike("company", `%${query.company}%`);
  return scoped;
}

async function fetchOwnJobs(query: JobsQuery, limit: number, offset: number): Promise<PublicJob[]> {
  if (limit <= 0 || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const db = supabaseAdmin();
    const q = applyOwnJobFilters(db.from("own_jobs").select("*").eq("is_active", true), query);
    const { data, error } = await q.order("posted_date", { ascending: false }).range(offset, offset + limit - 1);
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
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return 0;
  try {
    const db = supabaseAdmin();
    const q = applyOwnJobFilters(db.from("own_jobs").select("*", { count: "exact", head: true }).eq("is_active", true), query);
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
    const detail = err instanceof ArthaApiError
      ? `${err.code} (HTTP ${err.status})`
      : err instanceof Error ? err.message : "unknown upstream error";
    console.warn("[lib/jobs] Artha feed unavailable; trying cached listings:", detail);
    const result = await fetchCachedJobs(query);
    return { result, source: result.total > 0 ? "cached" : "unavailable" };
  }
}

export async function getJobsPage(query: JobsQuery = {}): Promise<JobsPageResult> {
  const limit = Math.min(100, Math.max(1, Math.floor(query.limit ?? 12)));
  const offset = Math.max(0, Math.floor(query.offset ?? 0));
  const normalized: JobsQuery = { ...query, limit, offset };
  const isSearching = Boolean(normalized.q?.trim());
  const ownTotal = await fetchOwnJobsCount(normalized);

  // Keep the external feed at the start of the combined list so users see
  // Artha listings immediately. Manual postings follow it; this makes the
  // offset mapping deterministic and prevents repeated own jobs on each page.
  const external = await fetchExternalJobs({
    ...normalized,
    limit: isSearching ? 100 : limit,
    offset: isSearching ? 0 : offset,
  });

  if (isSearching) {
    const terms = normalized.q!.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const strictMatches = external.result.items.filter((job) => {
      const haystack = `${job.title} ${job.company}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
    const total = strictMatches.length + ownTotal;
    const ownStart = Math.max(0, offset - strictMatches.length);
    const externalItems = strictMatches.slice(offset, offset + limit);
    const ownSlots = Math.max(0, limit - externalItems.length);
    const ownItems = await fetchOwnJobs(normalized, ownSlots, ownStart);
    const items = [...externalItems, ...ownItems];
    return {
      items, total, limit, offset, has_more: offset + limit < total,
      sources: { artha: external.source },
    };
  }

  const externalTotal = external.result.total;
  const externalItems = external.result.items.slice(0, limit);
  const ownStart = Math.max(0, offset - externalTotal);
  const ownSlots = Math.max(0, limit - externalItems.length);
  const ownItems = await fetchOwnJobs(normalized, ownSlots, ownStart);
  const items = [...externalItems, ...ownItems];
  const total = externalTotal + ownTotal;

  return {
    items, total, limit, offset, has_more: offset + limit < total,
    sources: { artha: external.source },
  };
}

export { ArthaApiError };
