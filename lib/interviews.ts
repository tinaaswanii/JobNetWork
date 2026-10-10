import { isValidTimezone, zonedToUtc } from "@/lib/datetime";

export const INTERVIEW_TYPES = ["phone", "video", "onsite", "technical", "hr", "assessment", "other"] as const;
export const INTERVIEW_TYPE_LABEL: Record<(typeof INTERVIEW_TYPES)[number], string> = {
  phone: "Phone screen",
  video: "Video call",
  onsite: "On-site",
  technical: "Technical",
  hr: "HR",
  assessment: "Assessment",
  other: "Other",
};
export const OUTCOMES = ["pending", "passed", "failed"] as const;
export const OUTCOME_LABEL: Record<(typeof OUTCOMES)[number], string> = {
  pending: "Awaiting result",
  passed: "Passed",
  failed: "Not selected",
};

export type Interview = {
  id: string;
  user_id: string;
  application_id: string;
  round: string | null;
  interview_type: (typeof INTERVIEW_TYPES)[number];
  scheduled_at: string;
  timezone: string;
  meeting_url: string | null;
  prep_notes: string | null;
  status: "scheduled" | "completed" | "cancelled";
  completed_at: string | null;
  outcome: (typeof OUTCOMES)[number];
  feedback: string | null;
  created_at: string;
  updated_at: string;
};

/** Form payload. `scheduled_local` is wall-clock time in `timezone` ("yyyy-MM-ddTHH:mm"). */
export type InterviewInput = {
  application_id: string;
  round: string;
  interview_type: string;
  scheduled_local: string;
  timezone: string;
  meeting_url: string;
  prep_notes: string;
};
export type InterviewErrors = Partial<Record<keyof InterviewInput, string>>;

export function validateInterview(i: InterviewInput): InterviewErrors {
  const e: InterviewErrors = {};
  if (!i.application_id) e.application_id = "Pick an application";
  if (i.round.length > 100) e.round = "Keep it under 100 characters";
  if (!(INTERVIEW_TYPES as readonly string[]).includes(i.interview_type)) e.interview_type = "Pick a type";
  if (!isValidTimezone(i.timezone)) e.timezone = "Pick a timezone";
  else if (!i.scheduled_local) e.scheduled_local = "Pick a date and time";
  else if (!zonedToUtc(i.scheduled_local, i.timezone)) e.scheduled_local = "Enter a valid date and time";
  if (i.meeting_url.trim()) {
    try {
      const u = new URL(i.meeting_url.trim());
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
    } catch {
      e.meeting_url = "Enter a valid http(s) link";
    }
  }
  if (i.prep_notes.length > 5000) e.prep_notes = "Keep notes under 5000 characters";
  return e;
}

export function interviewRow(i: InterviewInput) {
  const n = (s: string) => (s.trim() === "" ? null : s.trim());
  return {
    round: n(i.round),
    interview_type: i.interview_type,
    scheduled_at: zonedToUtc(i.scheduled_local, i.timezone)!.toISOString(),
    timezone: i.timezone,
    meeting_url: n(i.meeting_url),
    prep_notes: n(i.prep_notes),
  };
}
