import { createServerFn } from "@tanstack/react-start";
import type {
  ArthaFilters,
  JobsPageResult,
  JobsQuery,
  PublicJob,
} from "@/lib/jobs/types";

// Server-side client for the artha.link Public Jobs API.
// The API key is read inside the handlers — never at module scope and
// never exposed to the browser.

// Default matches the original repo (.env.example). Override with the
// ARTHA_BASE_URL secret if artha.link gives you a different API address.
const BASE_URL =
  process.env["ARTHA_BASE_URL"] ?? "https://api-usa.artha.link/api/v1";

class ArthaApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ArthaApiError";
  }
}

async function arthaFetch<T>(
  path: string,
  searchParams?: URLSearchParams,
): Promise<T> {
  const key = process.env["ARTHA_API_KEY"];
  if (!key) {
    throw new Error(
      "The job feed isn't connected yet — the site owner needs to add the job API key.",
    );
  }

  const url = `${BASE_URL}${path}${searchParams ? `?${searchParams.toString()}` : ""}`;
  const doFetch = () =>
    fetch(url, { headers: { "X-API-Key": key } });

  let res = await doFetch();

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") ?? "2", 10);
    await new Promise((r) =>
      setTimeout(r, Math.max(Number.isFinite(retryAfter) ? retryAfter : 2, 1) * 1000),
    );
    res = await doFetch(); // single retry
  }

  const body = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: T;
    error?: { code?: string; message?: string };
  } | null;

  if (!res.ok || !body?.success) {
    throw new ArthaApiError(
      body?.error?.code ?? "UNKNOWN_ERROR",
      body?.error?.message ?? `Job feed request failed (${res.status})`,
      res.status,
    );
  }

  return body.data as T;
}

function toParams(query: JobsQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  return params;
}

type CachedJobInsert = {
  slug: string;
  title: string;
  company: string;
  logo: string | null;
  description: string;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_curr: string | null;
  exp_min: number | null;
  exp_max: number | null;
  exp_unit: string | null;
  skills: string[];
  apply_url: string;
  posted_date: string | null;
  last_seen_at: string;
};

// Opportunistically upserts job-feed listings into cached_jobs, keyed by
// slug. Fire-and-forget: never let a caching failure break the listing
// response. Needed because the feed has no single-job endpoint — detail
// pages are served from this cache.
async function cacheJobsInBackground(jobs: PublicJob[]) {
  const rows: CachedJobInsert[] = jobs
    .filter((j) => j.slug && j.url)
    .map((j) => ({
      slug: j.slug,
      title: j.title,
      company: j.company,
      logo: j.logo ?? null,
      description: j.description ?? "",
      location: j.location ?? null,
      city: j.city ?? null,
      state: j.state ?? null,
      country: j.country ?? null,
      job_type: j.job_type ?? null,
      salary_min: j.salary_min ?? null,
      salary_max: j.salary_max ?? null,
      salary_curr: j.salary_curr ?? null,
      exp_min: j.exp_min ?? null,
      exp_max: j.exp_max ?? null,
      exp_unit: j.exp_unit ?? null,
      skills: j.skills ?? [],
      apply_url: j.url,
      posted_date: j.posted_date ?? null,
      last_seen_at: new Date().toISOString(),
    }));
  if (rows.length === 0) return;

  try {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("cached_jobs")
      .upsert(rows, { onConflict: "slug" });
    if (error) console.error("[job-cache] upsert failed", error);
  } catch (err) {
    console.error("[job-cache] upsert threw", err);
  }
}

function rowToPublicJob(row: {
  slug: string;
  title: string;
  company: string;
  logo: string | null;
  description: string;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_curr: string | null;
  exp_min: number | null;
  exp_max: number | null;
  exp_unit: string | null;
  skills: string[] | null;
  apply_url: string;
  posted_date: string | null;
}): PublicJob {
  return {
    id: row.slug,
    slug: row.slug,
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
    exp_min: row.exp_min,
    exp_max: row.exp_max,
    exp_unit: row.exp_unit,
    skills: row.skills ?? [],
    posted_date: row.posted_date ?? new Date().toISOString(),
    url: row.apply_url,
  };
}

export const getJobs = createServerFn({ method: "GET" })
  .inputValidator((query: JobsQuery) => query ?? {})
  .handler(async ({ data: query }): Promise<JobsPageResult> => {
    const isSearching = Boolean(query.q && query.q.trim());

    // Artha's search is fuzzy — ask for a bigger pool when searching, then
    // keep only genuine title/company matches (ported from lib/jobs.ts).
    const arthaQuery: JobsQuery = isSearching
      ? { ...query, limit: Math.max(query.limit ?? 10, 100) }
      : query;

    const result = await arthaFetch<JobsPageResult>(
      "/jobs",
      toParams(arthaQuery),
    );

    // Cache the raw feed page (before search filtering) so detail pages can
    // be served later from cached_jobs.
    void cacheJobsInBackground(result.items ?? []);

    let items = result.items;
    if (isSearching) {
      const terms = query
        .q!.trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      items = items.filter((job) => {
        const haystack = `${job.title} ${job.company}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
      });
    }

    return { ...result, items };
  });

export const getJobFilters = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArthaFilters> => {
    return arthaFetch<ArthaFilters>("/jobs/filters");
  },
);

export const getJobBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => {
    if (!slug || typeof slug !== "string") throw new Error("Missing job slug");
    return slug;
  })
  .handler(async ({ data: slug }): Promise<PublicJob | null> => {
    // Primary path: serve from cached_jobs (the feed has no single-job
    // endpoint; listings get cached on every /jobs request).
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: cached } = await supabaseAdmin
      .from("cached_jobs")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (cached) return rowToPublicJob(cached);

    // Cache-miss fallback: Artha's slugs are built from the job title, so
    // the slug words make a reasonable search query to relocate the job.
    const guessedQuery = slug.replace(/-[a-f0-9]{6,}$/i, "").replace(/-/g, " ");
    try {
      const result = await arthaFetch<JobsPageResult>(
        "/jobs",
        toParams({ q: guessedQuery, limit: 25 }),
      );
      const match = (result.items ?? []).find((j) => j.slug === slug);
      if (match) {
        void cacheJobsInBackground([match]);
        return match;
      }
    } catch (err) {
      console.error("[job-cache] fallback search failed", err);
    }

    return null;
  });
