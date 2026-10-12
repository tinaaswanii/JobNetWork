// Shared, browser-safe types for the public jobs feed (ported from JobNetWork).

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
  url: string; // creator-attributed artha.link link — always use this, never rebuild it
}

export interface JobsPageResult {
  items: PublicJob[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface JobsQuery {
  limit?: number;
  offset?: number;
  q?: string;
  location?: string;
  state?: string;
  city?: string;
  job_type?: string;
  work_mode?: string;
  exp_level?: string;
  company?: string;
  salary_min?: number;
  salary_max?: number;
  sort_by?: "most_relevant" | "newest" | "high_cpa";
}

export interface FilterOption {
  value: string;
  count: number;
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
