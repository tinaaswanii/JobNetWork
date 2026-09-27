/**
 * Server-side client for the artha.link Public Jobs API.
 * Import this ONLY from server code (route handlers, server components) —
 * never from a "use client" file, since it reads a secret env var.
 */

export interface PublicJob {
  id: string;
  slug: string;
  title: string;
  company: string;
  logo: string | null;
  description: string; // HTML
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
  posted_date: string;
  url: string; // creator-attributed artha.link link — ALWAYS use this, never rebuild it
}

export interface JobsResponse {
  items: PublicJob[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ArthaFilters {
  categories: FilterOption[];
  job_types: FilterOption[];
  experience_levels: FilterOption[];
  education_levels: FilterOption[];
  work_modes: FilterOption[];
  countries: FilterOption[];
  states: FilterOption[];
  cities: FilterOption[];
  companies: FilterOption[];
  industries: FilterOption[];
  salary_ranges: FilterOption[];
  total_jobs: number;
}

export interface FilterOption {
  value: string;
  count: number;
}

export class ArthaApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public requestId?: string
  ) {
    super(message);
    this.name = "ArthaApiError";
  }
}

const BASE_URL = process.env.ARTHA_BASE_URL ?? "https://api.artha.link/api/v1";

function authHeaders(): HeadersInit {
  const key = process.env.ARTHA_API_KEY;
  if (!key) {
    throw new Error(
      "ARTHA_API_KEY is not set. Add it to your environment (never hardcode it)."
    );
  }
  return { "X-API-Key": key };
}

/**
 * Low-level fetch wrapper: handles auth, JSON parsing, error shape,
 * and a single automatic retry on 429 using the Retry-After header.
 */
async function arthaFetch<T>(path: string, searchParams?: URLSearchParams): Promise<T> {
  const url = `${BASE_URL}${path}${searchParams ? `?${searchParams.toString()}` : ""}`;

  const doFetch = async () => {
    const res = await fetch(url, {
      headers: authHeaders(),
      // Jobs move fast — don't let Next.js cache stale listings for long.
      next: { revalidate: 60 },
    });
    return res;
  };

  let res = await doFetch();

  if (res.status === 429) {
    const retryAfterHeader = res.headers.get("Retry-After");
    const waitSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 2;
    const requestId = res.headers.get("X-Request-Id") ?? undefined;
    console.warn(
      `[artha] 429 rate limited, backing off ${waitSeconds}s (request_id=${requestId})`
    );
    await new Promise((r) => setTimeout(r, Math.max(waitSeconds, 1) * 1000));
    res = await doFetch(); // single retry; the route handler decides what to do if this also fails
  }

  const requestId = res.headers.get("X-Request-Id") ?? undefined;
  const body = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    const code = body?.error?.code ?? "UNKNOWN_ERROR";
    const message = body?.error?.message ?? `artha.link request failed (${res.status})`;
    throw new ArthaApiError(code, message, res.status, requestId);
  }

  return body.data as T;
}

export interface JobsQuery {
  limit?: number;
  offset?: number;
  q?: string;
  location?: string;
  state?: string;
  city?: string;
  niche_keywords?: string;
  negative_keywords?: string;
  job_type?: string;
  work_mode?: string;
  exp_level?: string;
  education?: string;
  industry?: string;
  company?: string;
  salary_min?: number;
  salary_max?: number;
  posted_after?: string;
  sort_by?: "most_relevant" | "newest" | "high_cpa";
}

export async function fetchJobs(query: JobsQuery = {}): Promise<JobsResponse> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  return arthaFetch<JobsResponse>("/jobs", params);
}

export async function fetchFilters(): Promise<ArthaFilters> {
  return arthaFetch<ArthaFilters>("/jobs/filters");
}
