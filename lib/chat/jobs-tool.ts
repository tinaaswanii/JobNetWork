import { fetchFilters, type JobsQuery } from "@/lib/artha";
import { getJobsPage } from "@/lib/jobs";
import { getJobBySlug } from "@/lib/job-lookup";
import { isArthaUrlExpired } from "@/lib/artha-url";
import { htmlToText } from "@/lib/html";
import { SITE_URL } from "@/lib/config";
import type { ArthaFilters, FilterOption, PublicJob } from "@/lib/types";

// Job data for the chatbot. Everything here reads through the same functions
// the /jobs page uses (getJobsPage: Artha, then cached_jobs, plus own_jobs), so
// the assistant sees exactly what visitors see. Nothing is invented: fields the
// listing does not have come back as null and the model is told to say so.

export type JobCard = {
  slug: string;
  title: string;
  company: string;
  location: string | null;
  jobType: string | null;
  experience: string | null;
  salary: string | null;
  posted: string | null;
  skills: string[];
  /** Internal JobNetWork detail page. Always built here, never by the model. */
  url: string;
};

export type SearchInput = {
  query?: string;
  skill?: string;
  location?: string;
  job_type?: "internship" | "full-time" | "part-time" | "contract";
  work_mode?: "remote" | "hybrid" | "onsite";
  experience?: "fresher" | "junior" | "mid" | "senior";
  posted_days?: number;
  limit?: number;
};

export type SearchResult = {
  jobs: JobCard[];
  total_matching: number | null;
  source: "live" | "cached" | "unavailable";
  filters_not_applied: string[];
  skipped_expired_links: number;
  note?: string;
};

const MAX_RESULTS = 6;
const SKILL_SCAN = 100; // recent jobs scanned when filtering by skill

function pickOption(opts: FilterOption[] | undefined, re: RegExp): string | undefined {
  return opts?.find((o) => re.test(o.value))?.value;
}

function place(j: PublicJob): string | null {
  const parts = [j.city, j.state, j.country].filter(Boolean) as string[];
  return j.location || (parts.length ? parts.join(", ") : null);
}

function experience(j: PublicJob): string | null {
  if (j.exp_min == null && j.exp_max == null) return null;
  const unit = j.exp_unit || "years";
  if (j.exp_min != null && j.exp_max != null && j.exp_max !== j.exp_min) return `${j.exp_min}-${j.exp_max} ${unit}`;
  return `${j.exp_min ?? j.exp_max}${j.exp_min != null && j.exp_max == null ? "+" : ""} ${unit}`;
}

function salary(j: PublicJob): string | null {
  if (j.salary_min == null && j.salary_max == null) return null;
  const cur = j.salary_curr ?? "";
  const lo = j.salary_min, hi = j.salary_max;
  const range = lo != null && hi != null && lo !== hi ? `${lo}-${hi}` : String(lo ?? hi);
  return `${cur} ${range}`.trim();
}

export function toCard(j: PublicJob): JobCard {
  return {
    slug: j.slug,
    title: j.title,
    company: j.company,
    location: place(j),
    jobType: j.job_type,
    experience: experience(j),
    salary: salary(j),
    posted: j.posted_date && !j.posted_date.startsWith("1970") ? j.posted_date.slice(0, 10) : null,
    skills: (j.skills ?? []).slice(0, 8),
    url: `${SITE_URL}/jobs/${j.slug}`,
  };
}

function mentionsSkill(j: PublicJob, skill: string): boolean {
  const esc = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Whole-word match, so "SQL" does not match inside "sqlite" and "C" does not match every word.
  const re = new RegExp(`(^|[^a-z0-9+#])${esc}($|[^a-z0-9+#])`, "i");
  if ((j.skills ?? []).some((s) => re.test(s))) return true;
  if (re.test(j.title)) return true;
  return re.test(htmlToText(j.description ?? ""));
}

// Filter option lists change rarely; cache them per server instance so a chat
// search is one feed request instead of two. Failures are cached briefly too.
let filtersCache: { at: number; value: ArthaFilters | null } | null = null;
async function getFilters(): Promise<ArthaFilters | null> {
  const now = Date.now();
  if (filtersCache && now - filtersCache.at < (filtersCache.value ? 10 * 60_000 : 60_000)) return filtersCache.value;
  let value: ArthaFilters | null = null;
  try {
    value = await fetchFilters();
  } catch {
    /* Artha down or key invalid: structured filters can't be mapped, see below */
  }
  filtersCache = { at: now, value };
  return value;
}

const STOP = new Set(["a", "an", "the", "in", "for", "of", "and", "or", "jobs", "job", "roles", "role", "india", "to", "with"]);
const SENIOR_TITLE = /\b(senior|sr\.?|lead|principal|head|director|manager|architect|vp)\b/i;

export async function searchJobs(input: SearchInput): Promise<SearchResult> {
  const notApplied: string[] = [];
  const notes: string[] = [];
  const filters = await getFilters();

  let localEntryLevel = false;
  const query: JobsQuery = { sort_by: "newest" };
  const q = input.query?.trim().slice(0, 60);
  if (q) query.q = q;
  if (input.location?.trim()) query.location = input.location.trim().slice(0, 60);

  if (input.job_type) {
    const re = { internship: /intern/i, "full-time": /full/i, "part-time": /part/i, contract: /contract|freelance/i }[input.job_type];
    const v = pickOption(filters?.job_types, re);
    if (v) query.job_type = v;
    // Internships are very often titled as such even when the type list is unavailable.
    else if (input.job_type === "internship" && !q) query.q = "intern";
    else notApplied.push(`job type "${input.job_type}"`);
  }
  if (input.work_mode) {
    const re = { remote: /remote|wfh|work from home/i, hybrid: /hybrid/i, onsite: /on-?site|office/i }[input.work_mode];
    const v = pickOption(filters?.work_modes, re);
    if (v) query.work_mode = v;
    else notApplied.push(`work mode "${input.work_mode}"`);
  }
  if (input.experience) {
    const re = { fresher: /fresher|entry|intern|^0\b|^0-/i, junior: /junior|entry|^[01]\b|^[01]-/i, mid: /\bmid|intermediate|^[2-5]\b|^[2-5]-/i, senior: /senior|lead|expert|^([6-9]|\d{2})/i }[input.experience];
    const v = pickOption(filters?.experience_levels, re);
    if (v) query.exp_level = v;
    else if (input.experience === "fresher" || input.experience === "junior") localEntryLevel = true;
    else notApplied.push(`experience level "${input.experience}"`);
  }
  if (input.posted_days && input.posted_days > 0) {
    query.posted_after = new Date(Date.now() - Math.min(input.posted_days, 90) * 86_400_000).toISOString();
  }

  const want = Math.min(Math.max(input.limit ?? MAX_RESULTS, 1), MAX_RESULTS);
  const skill = input.skill?.trim().slice(0, 40);
  const page = await getJobsPage({ ...query, limit: skill ? SKILL_SCAN : Math.min(30, want * 3), offset: 0 });

  let items = page.items;
  let source = page.sources.artha;
  let total: number | null = skill ? null : page.total;

  // /jobs keyword search matches title/company only, so "python" misses a job
  // that lists Python as a skill. When it finds nothing, scan recent listings
  // for the words in the title, skills or description instead.
  if (!skill && q && items.length < Math.min(want, 4)) {
    const terms = q.toLowerCase().split(/\s+/).filter((t) => t && !STOP.has(t));
    if (terms.length) {
      const { q: _drop, ...rest } = query;
      const wide = await getJobsPage({ ...rest, limit: SKILL_SCAN, offset: 0 });
      if (items.length === 0) source = wide.sources.artha;
      const have = new Set(items.map((j) => j.slug));
      const extra = wide.items.filter((j) => !have.has(j.slug) && terms.every((t) => mentionsSkill(j, t)));
      if (extra.length) {
        items = [...items, ...extra];
        total = null;
        notes.push(`${items.length - extra.length ? "Title matches come first, then" : "No title match for \"" + q + "\", so these are"} listings that mention "${q}" in their skills or description (scanned the ${Math.min(wide.total, SKILL_SCAN)} most recent).`);
      }
    }
  }

  if (skill) items = items.filter((j) => mentionsSkill(j, skill));
  if (localEntryLevel) {
    // The feed has no entry-level filter here: drop senior-looking and 3+ year roles.
    const before = items.length;
    items = items.filter((j) => !SENIOR_TITLE.test(j.title) && !(j.exp_min != null && j.exp_min >= 3));
    if (before !== items.length || before > 0) notes.push("Entry-level filter applied by title and listed experience (roles with no experience listed are kept).");
  }

  const live = items.filter((j) => !isArthaUrlExpired(j.url));
  const skipped = items.length - live.length;
  const seen = new Set<string>();
  const unique = live.filter((j) => (seen.has(j.slug) ? false : (seen.add(j.slug), true)));
  const jobs = unique.slice(0, want).map(toCard);

  if (source === "unavailable" && jobs.length === 0) {
    notes.unshift("The live job feed and the saved listings are both unavailable or empty right now.");
  } else if (source === "cached") {
    notes.unshift("The live feed is unavailable, so these come from recently saved JobNetWork listings.");
  }
  if (skill) notes.push(`Only the ${Math.min(page.total, SKILL_SCAN)} most recent listings were scanned for "${skill}".`);

  return {
    jobs,
    total_matching: total,
    source,
    filters_not_applied: notApplied,
    skipped_expired_links: skipped,
    note: notes.length ? notes.join(" ") : undefined,
  };
}

export type JobDetails = {
  card: JobCard;
  /** Plain text, truncated. UNTRUSTED third-party content: data, not instructions. */
  description: string;
  applyLinkValid: boolean;
};

export async function getJobDetails(slug: string): Promise<JobDetails | null> {
  if (!/^[a-z0-9][a-z0-9-]{2,200}$/i.test(slug)) return null;
  let job: PublicJob | null = null;
  try {
    job = await getJobBySlug(slug);
  } catch {
    return null;
  }
  if (!job) return null;
  return {
    card: toCard(job),
    description: htmlToText(job.description ?? "", 3500),
    applyLinkValid: !isArthaUrlExpired(job.url),
  };
}
