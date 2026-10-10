import type { Metadata } from "next";
import { supabaseServer } from "@/lib/auth/server";
import { todayIST } from "@/lib/datetime";
import type { FollowUp } from "@/lib/follow-ups";
import FollowUpsManager, { type FollowUpRow } from "@/components/dashboard/FollowUpsManager";

export const metadata: Metadata = { title: "Follow-ups", robots: { index: false, follow: false } };

export default async function FollowUpsPage() {
  const supabase = supabaseServer();
  const [fus, apps] = await Promise.all([
    supabase.from("follow_ups").select("*"),
    supabase.from("applications").select("id, company_name, job_title").order("updated_at", { ascending: false }),
  ]);
  if (fus.error) throw new Error(fus.error.message);
  if (apps.error) throw new Error(apps.error.message);

  const label = new Map((apps.data ?? []).map((a) => [a.id as string, `${a.job_title} — ${a.company_name}`]));
  const rows: FollowUpRow[] = ((fus.data ?? []) as FollowUp[]).map((f) => ({
    ...f,
    application_label: label.get(f.application_id) ?? "Application",
  }));

  return (
    <FollowUpsManager
      followUps={rows}
      apps={(apps.data ?? []).map((a) => ({ id: a.id, label: label.get(a.id)! }))}
      today={todayIST()}
    />
  );
}
