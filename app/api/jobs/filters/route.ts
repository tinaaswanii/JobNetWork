import { NextResponse } from "next/server";
import { fetchFilters, ArthaApiError } from "@/lib/artha";

const EMPTY_FILTERS = {
  categories: [],
  job_types: [],
  experience_levels: [],
  education_levels: [],
  work_modes: [],
  countries: [],
  states: [],
  cities: [],
  companies: [],
  industries: [],
  salary_ranges: [],
  total_jobs: 0,
};

export async function GET() {
  try {
    const filters = await fetchFilters();
    return NextResponse.json({ success: true, data: filters });
  } catch (err) {
    console.warn(
      "[api/jobs/filters] upstream filter fetch failed, returning empty filters:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ success: true, data: EMPTY_FILTERS });
  }
}
