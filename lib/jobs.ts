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

type PagePlan = { externalOffset: number; externalCount: number; ownOffset: number; ownCount: number };

// Create one deterministic combined sequence: up to eight Artha jobs, then
// one manually posted job. If either source runs out, the other continues.
// Counting positions from the beginning means page 2 never repeats page-1 jobs.
function planPage(offset: number, limit: number, externalTotal: number, ownTotal: number): PagePlan {
  const interval = ownTotal > 0 ? Math.max(1, Math.min(8, Math.floor(externalTotal / ownTotal))) : Number.POSITIVE_INFINITY;
  const cycles = ownTotal > 0 && externalTotal > 0
    ? Math.min(ownTotal, Math.ceil(externalTotal / interval))
    : 0;
  const interleaveLength = externalTotal + cycles;

  const ownBefore = (position: number) => {
    if (ownTotal === 0) return 0;
    if (position <= interleaveLength) {
      return Math.min(cycles, Math.floor(position / (interval + 1)));
    }
    return Math.min(ownTotal, cycles + position - interleaveLength);
  };
  const externalBefore = (position: number) => Math.min(externalTotal, Math.max(0, position - ownBefore(position)));
  const end = Math.min(offset + limit, externalTotal + ownTotal);
  const ownOffset = ownBefore(offset);
  const externalOffset = externalBefore(offset);
  const ownCount = Math.max(0, ownBefore(end) - ownOffset);
  const externalCount = Math.max(0, externalBefore(end) - externalOffset);
  return { externalOffset, externalCount, ownOffset, ownCount };
}

function mergePage(
  offset: number,
  limit: number,
  externalTotal: number,
  ownTotal: number,
  externalItems: PublicJob[],
  ownItems: PublicJob[]
): PublicJob[] {
  const plan = planPage(offset, limit, externalTotal, ownTotal);
  const interval = ownTotal > 0 ? Math.max(1, Math.min(8, Math.floor(externalTotal / ownTotal))) : Number.POSITIVE_INFINITY;
  const cycles = ownTotal > 0 && externalTotal > 0
    ? Math.min(ownTotal, Math.ceil(externalTotal / interval))
    : 0;
  const interleaveLength = externalTotal + cycles;
  const ownBefore = (position: number) => {
    if (ownTotal === 0) return 0;
    if (position <= interleaveLength) return Math.min(cycles, Math.floor(position / (interval + 1)));
    return Math.min(ownTotal, cycles + position - interleaveLength);
  };

  const items: PublicJob[] = [];
  let externalIndex = 0;
  let ownIndex = 0;
  const end = Math.min(offset + limit, externalTotal + ownTotal);
  for (let position = offset; position < end; position++) {
    if (ownBefore(position + 1) > ownBefore(position)) {
      if (ownIndex < ownItems.length) items.push(ownItems[ownIndex++]);
    } else if (externalIndex < externalItems.length) {
      items.push(externalItems[externalIndex++]);
    }
  }
  // Keep the helper's planned counts visible to TypeScript and make missing
  // upstream rows fail soft instead of inserting duplicates from another page.
  void plan;
  return items;
}

export async function getJobsPage(query: JobsQuery = {}): Promise<JobsPageResult> {
  const limit = Math.min(100, Math.max(1, Math.floor(query.limit ?? 12)));
  const offset = Math.max(0, Math.floor(query.offset ?? 0));
  const normalized: JobsQuery = { ...query, limit, offset };
  const isSearching = Boolean(normalized.q?.trim());
  const ownTotal = await fetchOwnJobsCount(normalized);

  if (isSearching) {
    // Artha search is fuzzy, so use a larger candidate set and keep only
    // exact title/company matches. The returned total reflects the strict set.
    const external = await fetchExternalJobs({ ...normalized, limit: 100, offset: 0 });
    const terms = normalized.q!.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const strictMatches = external.result.items.filter((job) => {
      const haystack = `${job.title} ${job.company}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
    const plan = planPage(offset, limit, strictMatches.length, ownTotal);
    const externalItems = strictMatches.slice(plan.externalOffset, plan.externalOffset + plan.externalCount);
    const ownItems = await fetchOwnJobs(normalized, plan.ownCount, plan.ownOffset);
    const items = mergePage(offset, limit, strictMatches.length, ownTotal, externalItems, ownItems);
    const total = strictMatches.length + ownTotal;
    return { items, total, limit, offset, has_more: offset + limit < total, sources: { artha: external.source } };
  }

  // Request enough external rows for this page. When local jobs occupy every
  // slot, still request one row so the external source's exact total is known.
  const first = await fetchExternalJobs({ ...normalized, limit, offset });
  const externalTotal = first.result.total;
  const plan = planPage(offset, limit, externalTotal, ownTotal);
  let external = first;
  if (plan.externalOffset !== offset || plan.externalCount !== limit) {
    external = await fetchExternalJobs({
      ...normalized,
      limit: Math.max(1, plan.externalCount),
      offset: plan.externalOffset,
    });
  }
  const externalItems = external.result.items.slice(0, plan.externalCount);
  const ownItems = await fetchOwnJobs(normalized, plan.ownCount, plan.ownOffset);
  const items = mergePage(offset, limit, externalTotal, ownTotal, externalItems, ownItems);
  const total = externalTotal + ownTotal;

  return { items, total, limit, offset, has_more: offset + limit < total, sources: { artha: external.source } };
}

export { ArthaApiError };
