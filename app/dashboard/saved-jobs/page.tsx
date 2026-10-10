import type { Metadata } from "next";
import { supabaseServer } from "@/lib/auth/server";
import SavedJobsList, { type SavedJob } from "@/components/dashboard/SavedJobsList";

export const metadata: Metadata = {
  title: "Saved jobs",
  robots: { index: false, follow: false },
};

export default async function SavedJobsPage() {
  const supabase = supabaseServer();
  const [saved, apps] = await Promise.all([
    supabase.from("saved_jobs").select("*").order("created_at", { ascending: false }),
    supabase.from("applications").select("id, job_id").not("job_id", "is", null),
  ]);
  if (saved.error) throw new Error(saved.error.message);

  const tracked = new Map((apps.data ?? []).map((a) => [a.job_id as string, a.id as string]));
  const jobs: SavedJob[] = (saved.data ?? []).map((j) => ({
    job_id: j.job_id,
    job_title: j.job_title,
    company_name: j.company_name,
    job_url: j.job_url,
    location: j.location,
    created_at: j.created_at,
    application_id: tracked.get(j.job_id) ?? null,
  }));

  return <SavedJobsList jobs={jobs} />;
}
