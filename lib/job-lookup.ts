import { supabaseAdmin } from "@/lib/supabase";
import { getArthaJobBySlug } from "@/lib/job-cache";
import type { PublicJob } from "@/lib/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getOwnJobBySlug(slug: string): Promise<PublicJob | null> {
  if (!UUID_RE.test(slug)) return null;
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("own_jobs")
    .select("*")
    .eq("id", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: `own_${data.id}`,
    slug: data.id,
    title: data.title,
    company: data.company,
    logo: data.logo,
    description: data.description,
    location: data.location,
    city: data.city,
    state: data.state,
    country: data.country,
    job_type: data.job_type,
    salary_min: data.salary_min,
    salary_max: data.salary_max,
    salary_curr: data.salary_curr,
    exp_min: null,
    exp_max: null,
    exp_unit: null,
    skills: data.skills ?? [],
    posted_date: data.posted_date,
    url: data.apply_url,
  };
}

export async function getJobBySlug(slug: string): Promise<PublicJob | null> {
  const own = await getOwnJobBySlug(slug);
  if (own) return own;
  return getArthaJobBySlug(slug);
}

