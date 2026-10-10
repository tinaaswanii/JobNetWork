export const STATUSES = [
  "interested",
  "applied",
  "assessment",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  interested: "Interested",
  applied: "Applied",
  assessment: "Assessment",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

// Badge + bar colours. Tailwind classes are written out in full so they aren't purged.
export const STATUS_BADGE: Record<Status, string> = {
  interested: "bg-muted text-muted-foreground",
  applied: "bg-blue-50 text-blue-800",
  assessment: "bg-amber-50 text-amber-800",
  interview: "bg-violet-50 text-violet-800",
  offer: "bg-green-50 text-green-800",
  rejected: "bg-red-50 text-red-800",
  withdrawn: "bg-gray-100 text-gray-600",
};
export const STATUS_BAR: Record<Status, string> = {
  interested: "bg-gray-400",
  applied: "bg-blue-500",
  assessment: "bg-amber-500",
  interview: "bg-violet-500",
  offer: "bg-green-600",
  rejected: "bg-red-500",
  withdrawn: "bg-gray-300",
};

export const WORK_MODES = ["remote", "hybrid", "onsite"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export type Application = {
  id: string;
  user_id: string;
  job_id: string | null;
  company_name: string;
  job_title: string;
  job_url: string | null;
  location: string | null;
  work_mode: WorkMode | null;
  employment_type: string | null;
  applied_at: string | null; // yyyy-mm-dd
  status: Status;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** What the form submits. Empty strings are normalised to null on the server. */
export type ApplicationInput = {
  company_name: string;
  job_title: string;
  job_url: string;
  location: string;
  work_mode: string;
  employment_type: string;
  applied_at: string;
  status: string;
  notes: string;
  job_id?: string | null;
};

export type FieldErrors = Partial<Record<keyof ApplicationInput, string>>;

const isStatus = (s: string): s is Status => (STATUSES as readonly string[]).includes(s);
export { isStatus };

/** Shared by the form (instant feedback) and the server actions (authoritative). */
export function validateApplication(i: ApplicationInput): FieldErrors {
  const e: FieldErrors = {};
  if (!i.company_name.trim()) e.company_name = "Company is required";
  else if (i.company_name.trim().length > 200) e.company_name = "Keep it under 200 characters";
  if (!i.job_title.trim()) e.job_title = "Job title is required";
  else if (i.job_title.trim().length > 200) e.job_title = "Keep it under 200 characters";
  if (i.job_url.trim()) {
    try {
      const u = new URL(i.job_url.trim());
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
    } catch {
      e.job_url = "Enter a valid http(s) link";
    }
  }
  if (i.location.length > 200) e.location = "Keep it under 200 characters";
  if (i.employment_type.length > 100) e.employment_type = "Keep it under 100 characters";
  if (i.work_mode && !(WORK_MODES as readonly string[]).includes(i.work_mode))
    e.work_mode = "Pick remote, hybrid or onsite";
  if (!isStatus(i.status)) e.status = "Pick a status";
  if (i.applied_at && !/^\d{4}-\d{2}-\d{2}$/.test(i.applied_at)) e.applied_at = "Enter a valid date";
  else if (i.applied_at && Number.isNaN(Date.parse(i.applied_at))) e.applied_at = "Enter a valid date";
  if (i.notes.length > 5000) e.notes = "Keep notes under 5000 characters";
  return e;
}

export function toRow(i: ApplicationInput) {
  const n = (s: string) => (s.trim() === "" ? null : s.trim());
  return {
    company_name: i.company_name.trim(),
    job_title: i.job_title.trim(),
    job_url: n(i.job_url),
    location: n(i.location),
    work_mode: n(i.work_mode),
    employment_type: n(i.employment_type),
    applied_at: n(i.applied_at),
    status: i.status,
    notes: n(i.notes),
  };
}

/**
 * Response rate = of the applications you actually submitted (anything past
 * "interested"), the share that got a reply (assessment, interview, offer or
 * rejection). Withdrawn counts as submitted but not as a reply.
 */
export function computeMetrics(apps: Pick<Application, "status">[]) {
  const count = (s: Status) => apps.filter((a) => a.status === s).length;
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, count(s)])) as Record<Status, number>;
  const submitted = apps.length - byStatus.interested;
  const responded = byStatus.assessment + byStatus.interview + byStatus.offer + byStatus.rejected;
  return {
    total: apps.length,
    interviews: byStatus.interview,
    offers: byStatus.offer,
    responseRate: submitted > 0 ? Math.round((responded / submitted) * 100) : null,
    byStatus,
  };
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: value.length === 10 ? "UTC" : "Asia/Kolkata",
  });
}
