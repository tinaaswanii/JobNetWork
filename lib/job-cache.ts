import { supabaseAdmin } from "@/lib/supabase";
import { fetchJobs } from "@/lib/artha";
import type { PublicJob } from "@/lib/types";

// Opportunistically upserts every Artha-sourced job (never own_jobs — those
// already live in their own table and are addressed by their own id) into
// cached_jobs, keyed by slug. Fire-and-forget: never let a caching failure
// break the actual page/API response that's showing these jobs to a user.
export function cacheArthaJobsInBackground(jobs: PublicJob[]) {
  const arthaJobs = jobs.filter((j) => !j.id.startsWith("own_"));
  if (arthaJobs.length === 0) return;

  const db = supabaseAdmin();
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

// Looks up a single Artha-sourced job by slug for the /jobs/[slug] detail
// page. Checks our own cache first (the common case — virtually every job
// gets cached the moment it appears in any listing). On a cache miss (e.g.
// someone hits a very fresh job's URL — from a just-generated sitemap entry
// or a freshly shared link — before any listing request has cached it yet),
// falls back to one live Artha search by slug text and caches the result if
// found, rather than giving up immediately.
export async function getArthaJobBySlug(slug: string): Promise<PublicJob | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("cached_jobs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) console.error("[job-cache] lookup failed", error);
  if (data) return rowToPublicJob(data as CachedJobRow);

  // Cache miss fallback: Artha's slugs are built from the job title, so the
  // words in the slug make a reasonable search query to try to relocate it.
  const guessedQuery = slug.replace(/-[a-f0-9]{6,}$/i, "").replace(/-/g, " ");
  try {
    const result = await fetchJobs({ q: guessedQuery, limit: 25 });
    const match = result.items.find((j) => j.slug === slug);
    if (match) {
      cacheArthaJobsInBackground([match]);
      return match;
    }
  } catch (err) {
    console.error("[job-cache] fallback fetch failed", err);
  }

  return null;
}
