import { supabaseAdmin } from "@/lib/supabase";
import { fetchJobs, type JobsQuery, type JobsResponse } from "@/lib/artha";
import { isArthaUrlExpired } from "@/lib/artha-url";
import type { PublicJob } from "@/lib/types";

// Opportunistically upserts every Artha-sourced job (never own_jobs) into
// cached_jobs, keyed by slug. Fire-and-forget: never let a caching failure
// break the response. Every live sighting also REFRESHES apply_url, which is
// what keeps signed Artha links from going stale.
export function cacheArthaJobsInBackground(jobs: PublicJob[]) {
  const arthaJobs = jobs.filter((j) => !j.id.startsWith("own_"));
  if (arthaJobs.length === 0) return;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[job-cache] skipping background cache: Supabase admin env is not configured");
    return;
  }

  let db: ReturnType<typeof supabaseAdmin>;
  try {
    db = supabaseAdmin();
  } catch (err) {
    console.warn("[job-cache] skipping background cache: Supabase admin client could not initialize", err);
    return;
  }
  const rows = arthaJobs.map((j) => ({
    slug: j.slug,
    title: j.title,
    company: j.company,
    logo: j.logo,
    description: j.description,
    location: j.location,
    city: j.city,
    state: j.state,
    country: j.country,
    job_type: j.job_type,
    salary_min: j.salary_min,
    salary_max: j.salary_max,
    salary_curr: j.salary_curr,
    exp_min: j.exp_min,
    exp_max: j.exp_max,
    exp_unit: j.exp_unit,
    skills: j.skills,
    apply_url: j.url,
    posted_date: j.posted_date,
    last_seen_at: new Date().toISOString(),
  }));

  db.from("cached_jobs")
    .upsert(rows, { onConflict: "slug" })
    .then(({ error }) => {
      if (error) console.error("[job-cache] upsert failed", error);
    });
}

export type CachedJobRow = {
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
};

function rowToPublicJob(row: CachedJobRow): PublicJob {
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

/**
 * Detail-page lookup by slug.
 *  1. Cached row with a still-valid apply link  -> return it.
 *  2. Cache miss OR expired link                -> one live Artha lookup, which returns a
 *                                                  fresh signed link and re-caches it.
 *  3. Live lookup fails / job gone              -> return the stale cached row (or null).
 *     Callers MUST check isArthaUrlExpired(job.url) before rendering an Apply link.
 */
export async function getArthaJobBySlug(slug: string): Promise<PublicJob | null> {
  let cached: PublicJob | null = null;
  try {
    const db = supabaseAdmin();
    const { data, error } = await db.from("cached_jobs").select("*").eq("slug", slug).maybeSingle();
    if (error) console.error("[job-cache] lookup failed", error.code ?? "");
    if (data) cached = rowToPublicJob(data as CachedJobRow);
  } catch (err) {
    console.error("[job-cache] lookup threw", err instanceof Error ? err.message : "unknown");
  }

  if (cached && !isArthaUrlExpired(cached.url)) return cached;

  // Artha slugs are built from the title, so the slug words make a usable search query.
  const guessedQuery = slug.replace(/-[a-f0-9]{6,}$/i, "").replace(/-/g, " ");
  try {
    const result = await fetchJobs({ q: guessedQuery, limit: 25 });
    const match = result.items.find((j) => j.slug === slug);
    if (match) {
      cacheArthaJobsInBackground([match]);
      return match;
    }
  } catch (err) {
    console.error("[job-cache] live refresh failed", err instanceof Error ? err.message : "unknown");
  }

  return cached;
}

/**
 * Fallback listing from cached_jobs when Artha is unreachable / rate-limited / key invalid.
 * Rows may carry expired signed links; the UI hides Apply for those (see JobCard).
 */
export async function fetchCachedJobs(query: JobsQuery = {}): Promise<JobsResponse> {
  const limit = Math.max(1, query.limit ?? 10);
  const offset = Math.max(0, query.offset ?? 0);
  const empty = { items: [], total: 0, limit, offset, has_more: false };

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return empty;

    const db = supabaseAdmin();
    let q = db.from("cached_jobs").select("*", { count: "exact" });

    const strip = (s: string) => s.replace(/[,()%*\\"]/g, " ").replace(/\s+/g, " ").trim();
    const search = query.q ? strip(query.q) : "";
    if (search) {
      q = q.or(
        ["title", "company", "description", "location", "city", "state", "country"]
          .map((c) => `${c}.ilike.%${search}%`)
          .join(",")
      );
    }
    const loc = query.location ? strip(query.location) : "";
    if (loc) q = q.or(`country.ilike.%${loc}%,location.ilike.%${loc}%`);
    if (query.job_type) q = q.eq("job_type", query.job_type);
    if (query.company) q = q.ilike("company", `%${strip(query.company)}%`);

    if (query.sort_by === "newest") {
      q = q.order("posted_date", { ascending: false, nullsFirst: false });
    } else {
      q = q.order("last_seen_at", { ascending: false, nullsFirst: false });
    }
    q = q.order("slug", { ascending: true }); // deterministic tie-breaker for stable pages

    q = q.range(offset, offset + limit - 1);
    const { data, count, error } = await q;

    if (error) {
      console.warn("[job-cache] fetchCachedJobs query warning:", error.code ?? "");
      return empty;
    }

    const items = ((data ?? []) as CachedJobRow[]).map(rowToPublicJob);
    const total = typeof count === "number" ? count : items.length;
    return { items, total, limit, offset, has_more: offset + limit < total };
  } catch (err) {
    console.warn("[job-cache] fetchCachedJobs unexpected error:", err instanceof Error ? err.message : "unknown");
    return empty;
  }
}
