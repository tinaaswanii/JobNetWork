import type { JobsQuery } from "@/lib/artha";
import { roleTerms } from "@/lib/role-presets";

// Filter state shared by the URL, the filter bar, the API route and the
// server-rendered first page. Pure and server-safe (no env, no fetches).
export interface Filters {
  q: string;
  location: string;
  job_type: string;
  work_mode: string;
  exp_level: string;
  posted: string; // "" | "1" | "7" | "30" (days)
  role: string; // "" | a key of ROLE_PRESETS
  sort_by: string;
}

export const emptyFilters: Filters = {
  q: "",
  location: "",
  job_type: "",
  work_mode: "",
  exp_level: "",
  posted: "",
  role: "",
  sort_by: "newest",
};

export const FILTER_KEYS = [
  "q",
  "job_type",
  "work_mode",
  "exp_level",
  "posted",
  "role",
  "sort_by",
  "location",
] as const satisfies readonly (keyof Filters)[];

// Page size for the jobs list. Lives here (not in the "use client" JobsBoard)
// because a constant imported from a client module is NOT a number on the server.
export const JOBS_PAGE_SIZE = 12;

export const POSTED_OPTIONS = [
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
] as const;

type Params = { get(name: string): string | null };

export function filtersFromParams(sp: Params): Filters {
  const out: Filters = { ...emptyFilters };
  for (const key of FILTER_KEYS) {
    const v = sp.get(key);
    if (v) out[key] = v;
  }
  if (!POSTED_OPTIONS.some((o) => o.value === out.posted)) out.posted = "";
  // "Most relevant" only means something when there is search text.
  if (out.sort_by === "most_relevant" && !out.q.trim()) out.sort_by = emptyFilters.sort_by;
  return out;
}

export function offsetFromParams(sp: Params): number {
  const o = parseInt(sp.get("offset") ?? "0", 10);
  return Number.isFinite(o) && o >= 0 ? o : 0;
}

export function postedAfter(days: string, now = Date.now()): string | undefined {
  const n = Number(days);
  if (!POSTED_OPTIONS.some((o) => o.value === days) || !Number.isFinite(n)) return undefined;
  return new Date(now - n * 86_400_000).toISOString();
}

export function buildJobsQuery(f: Filters, offset: number, limit: number): JobsQuery {
  const terms = roleTerms(f.role);
  return {
    limit,
    offset,
    q: f.q || undefined,
    location: f.location || undefined,
    job_type: f.job_type || undefined,
    work_mode: f.work_mode || undefined,
    exp_level: f.exp_level || undefined,
    posted_after: postedAfter(f.posted),
    // TODO(owner): niche_keywords is the keyword mechanism the alert form already
    // uses with Artha; confirm it matches ANY of the comma-separated words.
    niche_keywords: terms.length ? terms.join(",") : undefined,
    sort_by: (f.sort_by as JobsQuery["sort_by"]) || undefined,
  };
}

// Supabase `or()` filter matching ANY of the comma-separated words in the job
// title (used for own jobs and the cached fallback). Short words (UI, BI, SDE)
// only match as whole words, so "UI" does not hit "quiz" or "build".
export function titleKeywordFilter(keywords?: string): string | null {
  const terms = (keywords ?? "")
    .split(",")
    .map((t) => t.replace(/[()%*\\"_]/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 12);
  if (!terms.length) return null;
  const patterns = terms.flatMap((t) =>
    t.length >= 4
      ? [`%${t}%`]
      : [t, `${t} %`, `${t}/%`, `% ${t}`, `% ${t} %`, `% ${t}/%`, `%/${t}`, `%/${t} %`]
  );
  return patterns.map((p) => `title.ilike.${p}`).join(",");
}
