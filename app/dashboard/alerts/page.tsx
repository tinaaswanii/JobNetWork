import type { Metadata } from "next";
import { getUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchFilters } from "@/lib/artha";
import AlertsForm from "@/components/dashboard/AlertsForm";

export const metadata: Metadata = { title: "Job alerts", robots: { index: false, follow: false } };

export default async function AlertsPage() {
  const user = await getUser();
  const email = user?.email?.toLowerCase() ?? "";

  const { data } = await supabaseAdmin()
    .from("subscribers")
    .select("confirmed, filters")
    .eq("email", email)
    .maybeSingle();

  // Dropdown options come from the same source as the jobs page; fall back to free text if unavailable.
  let jobTypes: string[] = [];
  let workModes: string[] = [];
  try {
    const f = await fetchFilters();
    jobTypes = f.job_types.map((o) => o.value);
    workModes = f.work_modes.map((o) => o.value);
  } catch {}

  const f = (data?.filters ?? {}) as Record<string, string | undefined>;
  return (
    <AlertsForm
      email={email}
      initial={{
        enabled: data?.confirmed ?? false,
        keywords: f.niche_keywords ?? "",
        location: f.location ?? "",
        job_type: f.job_type ?? "",
        work_mode: f.work_mode ?? "",
      }}
      jobTypes={jobTypes}
      workModes={workModes}
    />
  );
}
