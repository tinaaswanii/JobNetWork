import type { Metadata } from "next";
import { supabaseServer } from "@/lib/auth/server";
import type { Interview } from "@/lib/interviews";
import InterviewsManager, { type InterviewRow } from "@/components/dashboard/InterviewsManager";

export const metadata: Metadata = { title: "Interviews", robots: { index: false, follow: false } };

export default async function InterviewsPage() {
  const supabase = supabaseServer();
  const [ints, apps] = await Promise.all([
    supabase.from("interviews").select("*"),
    supabase.from("applications").select("id, company_name, job_title").order("updated_at", { ascending: false }),
  ]);
  if (ints.error) throw new Error(ints.error.message);
  if (apps.error) throw new Error(apps.error.message);

  const label = new Map((apps.data ?? []).map((a) => [a.id as string, `${a.job_title} — ${a.company_name}`]));
  const rows: InterviewRow[] = ((ints.data ?? []) as Interview[]).map((i) => ({
    ...i,
    application_label: label.get(i.application_id) ?? "Application",
  }));

  return (
    <InterviewsManager
      interviews={rows}
      apps={(apps.data ?? []).map((a) => ({ id: a.id, label: label.get(a.id)! }))}
      nowIso={new Date().toISOString()}
    />
  );
}
