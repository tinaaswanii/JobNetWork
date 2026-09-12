export interface PublicJob {
  id: string;
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
  posted_date: string;
  url: string;
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
