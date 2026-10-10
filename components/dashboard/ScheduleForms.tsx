"use client";

import { useState } from "react";
import { Field, inputCls } from "./ApplicationForm";
import { TIMEZONES, utcToZonedLocal } from "@/lib/datetime";
import {
  type Interview,
  type InterviewErrors,
  type InterviewInput,
  INTERVIEW_TYPES,
  INTERVIEW_TYPE_LABEL,
  OUTCOMES,
  OUTCOME_LABEL,
  validateInterview,
} from "@/lib/interviews";
import {
  type FollowUp,
  type FollowUpErrors,
  type FollowUpInput,
  FOLLOW_UP_TYPES,
  FOLLOW_UP_TYPE_LABEL,
  validateFollowUp,
} from "@/lib/follow-ups";
import {
  completeInterview,
  createInterview,
  rescheduleInterview,
  updateInterview,
} from "@/app/dashboard/interviews/actions";
import { createFollowUp, rescheduleFollowUp, updateFollowUp } from "@/app/dashboard/follow-ups/actions";

export type AppOption = { id: string; label: string };

function Footer({ saving, label, onCancel }: { saving: boolean; label: string; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm">
        Cancel
      </button>
      <button type="submit" disabled={saving} className="rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {saving ? "Saving…" : label}
      </button>
    </div>
  );
}

function FormError({ msg }: { msg: string | null }) {
  return msg ? (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      {msg}
    </div>
  ) : null;
}

function AppSelect({
  apps,
  value,
  onChange,
  disabled,
  error,
}: {
  apps: AppOption[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <Field label="Application *" error={error}>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        <option value="">Select an application…</option>
        {apps.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function TimezoneSelect({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const zones: string[] = (TIMEZONES as readonly string[]).includes(value) ? [...TIMEZONES] : [value, ...TIMEZONES];
  return (
    <Field label="Timezone" error={error}>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {zones.map((z) => (
          <option key={z} value={z}>
            {z}
          </option>
        ))}
      </select>
    </Field>
  );
}

/* ------------------------------------------------------------------ interviews */

export function InterviewForm({
  apps,
  fixedApplicationId,
  editing,
  onDone,
  onCancel,
}: {
  apps: AppOption[];
  fixedApplicationId?: string;
  editing?: Interview | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<InterviewInput>(
    editing
      ? {
          application_id: editing.application_id,
          round: editing.round ?? "",
          interview_type: editing.interview_type,
          scheduled_local: utcToZonedLocal(editing.scheduled_at, editing.timezone),
          timezone: editing.timezone,
          meeting_url: editing.meeting_url ?? "",
          prep_notes: editing.prep_notes ?? "",
        }
      : {
          application_id: fixedApplicationId ?? "",
          round: "",
          interview_type: "video",
          scheduled_local: "",
          timezone: "Asia/Kolkata",
          meeting_url: "",
          prep_notes: "",
        }
  );
  const [errors, setErrors] = useState<InterviewErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set =
    (k: keyof InterviewInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setV((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const local = validateInterview(v);
    setErrors(local);
    if (Object.keys(local).length) return;
    setSaving(true);
    const r = editing ? await updateInterview(editing.id, v) : await createInterview(v);
    setSaving(false);
    if (r.ok) return onDone();
    setFormError(r.error);
    if (r.fieldErrors) setErrors(r.fieldErrors);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormError msg={formError} />
      <AppSelect
        apps={apps}
        value={v.application_id}
        onChange={(id) => setV((p) => ({ ...p, application_id: id }))}
        disabled={!!fixedApplicationId || !!editing}
        error={errors.application_id}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Round" error={errors.round}>
          <input className={inputCls} value={v.round} onChange={set("round")} placeholder="Round 1, Final…" />
        </Field>
        <Field label="Type" error={errors.interview_type}>
          <select className={inputCls} value={v.interview_type} onChange={set("interview_type")}>
            {INTERVIEW_TYPES.map((t) => (
              <option key={t} value={t}>
                {INTERVIEW_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date & time *" error={errors.scheduled_local}>
          <input type="datetime-local" className={inputCls} value={v.scheduled_local} onChange={set("scheduled_local")} />
        </Field>
        <TimezoneSelect value={v.timezone} onChange={(z) => setV((p) => ({ ...p, timezone: z }))} error={errors.timezone} />
      </div>
      <Field label="Meeting link" error={errors.meeting_url}>
        <input type="url" className={inputCls} value={v.meeting_url} onChange={set("meeting_url")} placeholder="https://" />
      </Field>
      <Field label="Prep notes" error={errors.prep_notes}>
        <textarea className={inputCls} rows={3} value={v.prep_notes} onChange={set("prep_notes")} />
      </Field>
      <Footer saving={saving} label={editing ? "Save changes" : "Schedule interview"} onCancel={onCancel} />
    </form>
  );
}

export function RescheduleInterviewForm({
  interview,
  onDone,
  onCancel,
}: {
  interview: Interview;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [tz, setTz] = useState(interview.timezone);
  const [when, setWhen] = useState(utcToZonedLocal(interview.scheduled_at, interview.timezone));
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!when) return setErr("Pick a date and time.");
    setSaving(true);
    const r = await rescheduleInterview(interview.id, when, tz);
    setSaving(false);
    if (r.ok) onDone();
    else setErr(r.error);
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <FormError msg={err} />
      <Field label="New date & time">
        <input type="datetime-local" className={inputCls} value={when} onChange={(e) => setWhen(e.target.value)} />
      </Field>
      <TimezoneSelect value={tz} onChange={setTz} />
      <Footer saving={saving} label="Reschedule" onCancel={onCancel} />
    </form>
  );
}

export function CompleteInterviewForm({
  interview,
  onDone,
  onCancel,
}: {
  interview: Interview;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [outcome, setOutcome] = useState<string>(interview.outcome);
  const [feedback, setFeedback] = useState(interview.feedback ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const r = await completeInterview(interview.id, outcome, feedback);
    setSaving(false);
    if (r.ok) onDone();
    else setErr(r.error);
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <FormError msg={err} />
      <Field label="Outcome">
        <select className={inputCls} value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          {OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {OUTCOME_LABEL[o]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Feedback / how it went">
        <textarea className={inputCls} rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      </Field>
      <Footer saving={saving} label="Mark complete" onCancel={onCancel} />
    </form>
  );
}

/* ------------------------------------------------------------------ follow-ups */

export function FollowUpForm({
  apps,
  fixedApplicationId,
  editing,
  onDone,
  onCancel,
}: {
  apps: AppOption[];
  fixedApplicationId?: string;
  editing?: FollowUp | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<FollowUpInput>(
    editing
      ? {
          application_id: editing.application_id,
          title: editing.title,
          follow_up_type: editing.follow_up_type,
          due_date: editing.due_date,
          notes: editing.notes ?? "",
        }
      : { application_id: fixedApplicationId ?? "", title: "", follow_up_type: "email", due_date: "", notes: "" }
  );
  const [errors, setErrors] = useState<FollowUpErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set =
    (k: keyof FollowUpInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setV((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const local = validateFollowUp(v);
    setErrors(local);
    if (Object.keys(local).length) return;
    setSaving(true);
    const r = editing ? await updateFollowUp(editing.id, v) : await createFollowUp(v);
    setSaving(false);
    if (r.ok) return onDone();
    setFormError(r.error);
    if (r.fieldErrors) setErrors(r.fieldErrors);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormError msg={formError} />
      <AppSelect
        apps={apps}
        value={v.application_id}
        onChange={(id) => setV((p) => ({ ...p, application_id: id }))}
        disabled={!!fixedApplicationId || !!editing}
        error={errors.application_id}
      />
      <Field label="Title *" error={errors.title}>
        <input className={inputCls} value={v.title} onChange={set("title")} placeholder="Check in with recruiter" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" error={errors.follow_up_type}>
          <select className={inputCls} value={v.follow_up_type} onChange={set("follow_up_type")}>
            {FOLLOW_UP_TYPES.map((t) => (
              <option key={t} value={t}>
                {FOLLOW_UP_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Due date *" error={errors.due_date}>
          <input type="date" className={inputCls} value={v.due_date} onChange={set("due_date")} />
        </Field>
      </div>
      <Field label="Notes" error={errors.notes}>
        <textarea className={inputCls} rows={3} value={v.notes} onChange={set("notes")} />
      </Field>
      <Footer saving={saving} label={editing ? "Save changes" : "Add follow-up"} onCancel={onCancel} />
    </form>
  );
}

export function RescheduleFollowUpForm({
  followUp,
  onDone,
  onCancel,
}: {
  followUp: FollowUp;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(followUp.due_date);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const r = await rescheduleFollowUp(followUp.id, date);
    setSaving(false);
    if (r.ok) onDone();
    else setErr(r.error);
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <FormError msg={err} />
      <Field label="New due date">
        <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Footer saving={saving} label="Reschedule" onCancel={onCancel} />
    </form>
  );
}
