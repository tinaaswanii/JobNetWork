export const FOLLOW_UP_TYPES = ["email", "call", "linkedin", "thank_you", "other"] as const;
export const FOLLOW_UP_TYPE_LABEL: Record<(typeof FOLLOW_UP_TYPES)[number], string> = {
  email: "Email",
  call: "Call",
  linkedin: "LinkedIn message",
  thank_you: "Thank-you note",
  other: "Other",
};

export type FollowUp = {
  id: string;
  user_id: string;
  application_id: string;
  title: string;
  follow_up_type: (typeof FOLLOW_UP_TYPES)[number];
  due_date: string; // yyyy-mm-dd
  notes: string | null;
  status: "pending" | "completed";
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FollowUpInput = {
  application_id: string;
  title: string;
  follow_up_type: string;
  due_date: string;
  notes: string;
};
export type FollowUpErrors = Partial<Record<keyof FollowUpInput, string>>;

export function validateFollowUp(i: FollowUpInput): FollowUpErrors {
  const e: FollowUpErrors = {};
  if (!i.application_id) e.application_id = "Pick an application";
  if (!i.title.trim()) e.title = "Title is required";
  else if (i.title.trim().length > 200) e.title = "Keep it under 200 characters";
  if (!(FOLLOW_UP_TYPES as readonly string[]).includes(i.follow_up_type)) e.follow_up_type = "Pick a type";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(i.due_date) || Number.isNaN(Date.parse(i.due_date)))
    e.due_date = "Pick a due date";
  if (i.notes.length > 5000) e.notes = "Keep notes under 5000 characters";
  return e;
}

export function followUpRow(i: FollowUpInput) {
  return {
    title: i.title.trim(),
    follow_up_type: i.follow_up_type,
    due_date: i.due_date,
    notes: i.notes.trim() === "" ? null : i.notes.trim(),
  };
}

export const isOverdue = (f: Pick<FollowUp, "status" | "due_date">, today: string) =>
  f.status === "pending" && f.due_date < today;
