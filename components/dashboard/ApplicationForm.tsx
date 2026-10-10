"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  type Application,
  type ApplicationInput,
  type FieldErrors,
  STATUSES,
  STATUS_LABEL,
  WORK_MODES,
  validateApplication,
} from "@/lib/applications";
import {
  type ActionResult,
  createApplication,
  updateApplication,
} from "@/app/dashboard/applications/actions";

export const EMPTY: ApplicationInput = {
  company_name: "",
  job_title: "",
  job_url: "",
  location: "",
  work_mode: "",
  employment_type: "",
  applied_at: "",
  status: "applied",
  notes: "",
};

export const toInput = (a: Application): ApplicationInput => ({
  company_name: a.company_name,
  job_title: a.job_title,
  job_url: a.job_url ?? "",
  location: a.location ?? "",
  work_mode: a.work_mode ?? "",
  employment_type: a.employment_type ?? "",
  applied_at: a.applied_at ?? "",
  status: a.status,
  notes: a.notes ?? "",
});

export const inputCls =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-board focus:ring-1 focus:ring-board";

export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  // Portal to <body> so a transformed ancestor (e.g. a job card) can't trap the overlay.
  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-ink">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

export function ApplicationForm({
  editing,
  initial,
  onDone,
  onCancel,
}: {
  editing: Application | null;
  /** Prefill for a NEW application (e.g. from a public job). Ignored when editing. */
  initial?: Partial<ApplicationInput>;
  onDone: (r: Extract<ActionResult, { ok: true }>) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<ApplicationInput>(editing ? toInput(editing) : { ...EMPTY, ...initial });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ApplicationInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const local = validateApplication(v);
    setErrors(local);
    if (Object.keys(local).length) return;
    setSaving(true);
    const r = editing ? await updateApplication(editing.id, v) : await createApplication(v);
    setSaving(false);
    if (r.ok) return onDone(r);
    setFormError(r.error);
    if (r.fieldErrors) setErrors(r.fieldErrors);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {formError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {formError}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company *" error={errors.company_name}>
          <input className={inputCls} value={v.company_name} onChange={set("company_name")} autoFocus />
        </Field>
        <Field label="Job title *" error={errors.job_title}>
          <input className={inputCls} value={v.job_title} onChange={set("job_title")} />
        </Field>
        <Field label="Status" error={errors.status}>
          <select className={inputCls} value={v.status} onChange={set("status")}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Applied on" error={errors.applied_at}>
          <input type="date" className={inputCls} value={v.applied_at} onChange={set("applied_at")} />
        </Field>
        <Field label="Location" error={errors.location}>
          <input className={inputCls} value={v.location} onChange={set("location")} />
        </Field>
        <Field label="Work mode" error={errors.work_mode}>
          <select className={inputCls} value={v.work_mode} onChange={set("work_mode")}>
            <option value="">—</option>
            {WORK_MODES.map((w) => (
              <option key={w} value={w}>
                {w[0].toUpperCase() + w.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Employment type" error={errors.employment_type}>
          <input className={inputCls} value={v.employment_type} onChange={set("employment_type")} placeholder="Internship, Full-time…" />
        </Field>
        <Field label="Job link" error={errors.job_url}>
          <input type="url" className={inputCls} value={v.job_url} onChange={set("job_url")} placeholder="https://" />
        </Field>
      </div>
      <Field label="Notes" error={errors.notes}>
        <textarea className={inputCls} rows={3} value={v.notes} onChange={set("notes")} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : editing ? "Save changes" : "Add application"}
        </button>
      </div>
    </form>
  );
}

