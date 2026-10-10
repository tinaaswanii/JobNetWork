"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/auth/server";
import {
  type ApplicationInput,
  type FieldErrors,
  STATUSES,
  isStatus,
  toRow,
  validateApplication,
} from "@/lib/applications";

export type ActionResult =
  | { ok: true; id?: string; existing?: boolean }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

const UNAUTH: ActionResult = { ok: false, error: "Your session expired. Please sign in again." };

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
}

/**
 * The owner is ALWAYS the verified session user — never an id from the client.
 * RLS is a second line of defence (queries run as the user, not service role).
 */
async function session() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, userId: data.user.id } : null;
}

async function logActivity(
  s: NonNullable<Awaited<ReturnType<typeof session>>>,
  applicationId: string,
  type: string,
  description: string
) {
  // Best-effort audit trail; never fail the main action because of it.
  await s.supabase.from("application_activities").insert({
    user_id: s.userId,
    application_id: applicationId,
    activity_type: type,
    description,
  });
}

export async function createApplication(input: ApplicationInput): Promise<ActionResult> {
  const s = await session();
  if (!s) return UNAUTH;
  const fieldErrors = validateApplication(input);
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

  // Optional link to a public job. Plain text id (slug or uuid); not a security boundary.
  const jobId = typeof input.job_id === "string" && input.job_id.trim() ? input.job_id.trim().slice(0, 200) : null;

  if (jobId) {
    // Already tracking this job? Return that application instead of duplicating.
    const { data: existing } = await s.supabase
      .from("applications")
      .select("id")
      .eq("user_id", s.userId)
      .eq("job_id", jobId)
      .maybeSingle();
    if (existing) return { ok: true, id: existing.id, existing: true };
  }

  const { data, error } = await s.supabase
    .from("applications")
    .insert({ ...toRow(input), job_id: jobId, user_id: s.userId })
    .select("id")
    .single();
  if (error || !data) {
    // Unique (user_id, job_id) race: another tab created it between check and insert.
    if (jobId && error?.code === "23505") {
      const { data: again } = await s.supabase
        .from("applications")
        .select("id")
        .eq("user_id", s.userId)
        .eq("job_id", jobId)
        .maybeSingle();
      if (again) return { ok: true, id: again.id, existing: true };
    }
    return { ok: false, error: "Couldn't save the application. Please try again." };
  }

  await logActivity(s, data.id, "created", `Added with status "${input.status}"`);
  refresh();
  return { ok: true, id: data.id };
}

export async function updateApplication(id: string, input: ApplicationInput): Promise<ActionResult> {
  const s = await session();
  if (!s) return UNAUTH;
  const fieldErrors = validateApplication(input);
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

  const { data: prev } = await s.supabase
    .from("applications")
    .select("status")
    .eq("id", id)
    .eq("user_id", s.userId)
    .maybeSingle();
  if (!prev) return { ok: false, error: "Application not found." };

  const { error } = await s.supabase
    .from("applications")
    .update(toRow(input))
    .eq("id", id)
    .eq("user_id", s.userId);
  if (error) return { ok: false, error: "Couldn't save changes. Please try again." };

  if (prev.status !== input.status)
    await logActivity(s, id, "status_changed", `Status: ${prev.status} → ${input.status}`);
  refresh();
  return { ok: true };
}

export async function setApplicationStatus(id: string, status: string): Promise<ActionResult> {
  const s = await session();
  if (!s) return UNAUTH;
  if (!isStatus(status) || !STATUSES.includes(status)) return { ok: false, error: "Invalid status." };

  const { data: prev } = await s.supabase
    .from("applications")
    .select("status")
    .eq("id", id)
    .eq("user_id", s.userId)
    .maybeSingle();
  if (!prev) return { ok: false, error: "Application not found." };
  if (prev.status === status) return { ok: true };

  const { error } = await s.supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .eq("user_id", s.userId);
  if (error) return { ok: false, error: "Couldn't update the status. Please try again." };

  await logActivity(s, id, "status_changed", `Status: ${prev.status} → ${status}`);
  refresh();
  return { ok: true };
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  const s = await session();
  if (!s) return UNAUTH;
  const { error } = await s.supabase.from("applications").delete().eq("id", id).eq("user_id", s.userId);
  if (error) return { ok: false, error: "Couldn't delete the application. Please try again." };
  refresh();
  return { ok: true };
}
