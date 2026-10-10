"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/auth/server";
import {
  type InterviewInput,
  type InterviewErrors,
  OUTCOMES,
  interviewRow,
  validateInterview,
} from "@/lib/interviews";
import { isValidTimezone, zonedToUtc } from "@/lib/datetime";

export type Result = { ok: true } | { ok: false; error: string; fieldErrors?: InterviewErrors };

const UNAUTH: Result = { ok: false, error: "Your session expired. Please sign in again." };

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/interviews");
  revalidatePath("/dashboard/applications");
}

async function session() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, userId: data.user.id } : null;
}
type S = NonNullable<Awaited<ReturnType<typeof session>>>;

async function ownsApplication(s: S, id: string) {
  const { data } = await s.supabase.from("applications").select("id").eq("id", id).eq("user_id", s.userId).maybeSingle();
  return !!data;
}

async function log(s: S, applicationId: string, type: string, description: string) {
  await s.supabase.from("application_activities").insert({
    user_id: s.userId,
    application_id: applicationId,
    activity_type: type,
    description,
  });
}

export async function createInterview(input: InterviewInput): Promise<Result> {
  const s = await session();
  if (!s) return UNAUTH;
  const fieldErrors = validateInterview(input);
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  if (!(await ownsApplication(s, input.application_id))) return { ok: false, error: "Application not found." };

  const { error } = await s.supabase
    .from("interviews")
    .insert({ ...interviewRow(input), user_id: s.userId, application_id: input.application_id });
  if (error) return { ok: false, error: "Couldn't schedule the interview. Please try again." };

  await log(s, input.application_id, "interview_scheduled", `Interview scheduled${input.round ? ` (${input.round})` : ""}`);
  refresh();
  return { ok: true };
}

/** Edit details. The parent application can't be changed after creation. */
export async function updateInterview(id: string, input: InterviewInput): Promise<Result> {
  const s = await session();
  if (!s) return UNAUTH;
  const fieldErrors = validateInterview(input);
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

  const { data, error } = await s.supabase
    .from("interviews")
    .update(interviewRow(input))
    .eq("id", id)
    .eq("user_id", s.userId)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: "Couldn't save changes. Please try again." };
  if (!data) return { ok: false, error: "Interview not found." };
  refresh();
  return { ok: true };
}

export async function rescheduleInterview(id: string, scheduledLocal: string, timezone: string): Promise<Result> {
  const s = await session();
  if (!s) return UNAUTH;
  const when = isValidTimezone(timezone) ? zonedToUtc(scheduledLocal, timezone) : null;
  if (!when) return { ok: false, error: "Enter a valid date and time." };

  const { data, error } = await s.supabase
    .from("interviews")
    .update({ scheduled_at: when.toISOString(), timezone, status: "scheduled", completed_at: null })
    .eq("id", id)
    .eq("user_id", s.userId)
    .select("application_id")
    .maybeSingle();
  if (error) return { ok: false, error: "Couldn't reschedule. Please try again." };
  if (!data) return { ok: false, error: "Interview not found." };
  await log(s, data.application_id, "interview_rescheduled", "Interview rescheduled");
  refresh();
  return { ok: true };
}

export async function completeInterview(id: string, outcome: string, feedback: string): Promise<Result> {
  const s = await session();
  if (!s) return UNAUTH;
  if (!(OUTCOMES as readonly string[]).includes(outcome)) return { ok: false, error: "Pick an outcome." };
  if (feedback.length > 5000) return { ok: false, error: "Keep feedback under 5000 characters." };

  const { data, error } = await s.supabase
    .from("interviews")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      outcome,
      feedback: feedback.trim() === "" ? null : feedback.trim(),
    })
    .eq("id", id)
    .eq("user_id", s.userId)
    .select("application_id")
    .maybeSingle();
  if (error) return { ok: false, error: "Couldn't mark it complete. Please try again." };
  if (!data) return { ok: false, error: "Interview not found." };
  await log(s, data.application_id, "interview_completed", "Interview completed");
  refresh();
  return { ok: true };
}

export async function deleteInterview(id: string): Promise<Result> {
  const s = await session();
  if (!s) return UNAUTH;
  const { error } = await s.supabase.from("interviews").delete().eq("id", id).eq("user_id", s.userId);
  if (error) return { ok: false, error: "Couldn't delete the interview. Please try again." };
  refresh();
  return { ok: true };
}
