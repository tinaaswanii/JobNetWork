"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/auth/server";
import { type FollowUpInput, type FollowUpErrors, followUpRow, validateFollowUp } from "@/lib/follow-ups";

export type Result = { ok: true } | { ok: false; error: string; fieldErrors?: FollowUpErrors };

const UNAUTH: Result = { ok: false, error: "Your session expired. Please sign in again." };

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard/applications");
}

async function session() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, userId: data.user.id } : null;
}
type S = NonNullable<Awaited<ReturnType<typeof session>>>;

async function log(s: S, applicationId: string, type: string, description: string) {
  await s.supabase.from("application_activities").insert({
    user_id: s.userId,
    application_id: applicationId,
    activity_type: type,
    description,
  });
}

export async function createFollowUp(input: FollowUpInput): Promise<Result> {
  const s = await session();
  if (!s) return UNAUTH;
  const fieldErrors = validateFollowUp(input);
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

  const { data: app } = await s.supabase
    .from("applications")
    .select("id")
    .eq("id", input.application_id)
    .eq("user_id", s.userId)
    .maybeSingle();
  if (!app) return { ok: false, error: "Application not found." };

  const { error } = await s.supabase
    .from("follow_ups")
    .insert({ ...followUpRow(input), user_id: s.userId, application_id: input.application_id });
  if (error) return { ok: false, error: "Couldn't save the follow-up. Please try again." };
  refresh();
  return { ok: true };
}

export async function updateFollowUp(id: string, input: FollowUpInput): Promise<Result> {
  const s = await session();
  if (!s) return UNAUTH;
  const fieldErrors = validateFollowUp(input);
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

  const { data, error } = await s.supabase
    .from("follow_ups")
    .update(followUpRow(input))
    .eq("id", id)
    .eq("user_id", s.userId)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: "Couldn't save changes. Please try again." };
  if (!data) return { ok: false, error: "Follow-up not found." };
  refresh();
  return { ok: true };
}

export async function rescheduleFollowUp(id: string, dueDate: string): Promise<Result> {
  const s = await session();
  if (!s) return UNAUTH;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(dueDate)))
    return { ok: false, error: "Pick a valid date." };

  const { data, error } = await s.supabase
    .from("follow_ups")
    .update({ due_date: dueDate })
    .eq("id", id)
    .eq("user_id", s.userId)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: "Couldn't reschedule. Please try again." };
  if (!data) return { ok: false, error: "Follow-up not found." };
  refresh();
  return { ok: true };
}

/** completed=false reopens it (clears the timestamp, satisfying the table's consistency check). */
export async function setFollowUpCompleted(id: string, completed: boolean): Promise<Result> {
  const s = await session();
  if (!s) return UNAUTH;
  const { data, error } = await s.supabase
    .from("follow_ups")
    .update(
      completed
        ? { status: "completed", completed_at: new Date().toISOString() }
        : { status: "pending", completed_at: null }
    )
    .eq("id", id)
    .eq("user_id", s.userId)
    .select("application_id, title")
    .maybeSingle();
  if (error) return { ok: false, error: "Couldn't update the follow-up. Please try again." };
  if (!data) return { ok: false, error: "Follow-up not found." };
  if (completed) await log(s, data.application_id, "follow_up_completed", `Follow-up done: ${data.title}`);
  refresh();
  return { ok: true };
}

export async function deleteFollowUp(id: string): Promise<Result> {
  const s = await session();
  if (!s) return UNAUTH;
  const { error } = await s.supabase.from("follow_ups").delete().eq("id", id).eq("user_id", s.userId);
  if (error) return { ok: false, error: "Couldn't delete the follow-up. Please try again." };
  refresh();
  return { ok: true };
}
