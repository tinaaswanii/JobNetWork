"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/auth/server";

export type SaveResult = { ok: true } | { ok: false; error: string };

export type JobSnapshot = {
  job_id: string;
  title: string;
  company: string;
  location: string | null;
  url: string | null;
};

const UNAUTH: SaveResult = { ok: false, error: "Please sign in to save jobs." };

const clip = (v: unknown, max: number) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

function safeUrl(v: unknown) {
  const s = clip(v, 2000);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:" ? s : null;
  } catch {
    return null;
  }
}

/** Owner is the verified session user; the snapshot is only display text. */
export async function saveJob(job: JobSnapshot): Promise<SaveResult> {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return UNAUTH;
  const jobId = clip(job.job_id, 200);
  if (!jobId) return { ok: false, error: "Invalid job." };

  const { error } = await supabase.from("saved_jobs").upsert(
    {
      user_id: data.user.id,
      job_id: jobId,
      job_title: clip(job.title, 200),
      company_name: clip(job.company, 200),
      job_url: safeUrl(job.url),
      location: clip(job.location, 200),
    },
    { onConflict: "user_id,job_id", ignoreDuplicates: true }
  );
  if (error) return { ok: false, error: "Couldn't save this job. Please try again." };
  revalidatePath("/dashboard/saved-jobs");
  return { ok: true };
}

export async function removeSavedJob(jobId: string): Promise<SaveResult> {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return UNAUTH;
  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", data.user.id)
    .eq("job_id", jobId);
  if (error) return { ok: false, error: "Couldn't remove this job. Please try again." };
  revalidatePath("/dashboard/saved-jobs");
  return { ok: true };
}
