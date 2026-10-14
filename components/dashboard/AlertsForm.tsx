"use client";

import { useState } from "react";
import { Field, inputCls } from "./ApplicationForm";
import { type AlertInput, saveAlerts } from "@/app/dashboard/alerts/actions";

export default function AlertsForm({
  email,
  initial,
  jobTypes,
  workModes,
}: {
  email: string;
  initial: AlertInput;
  jobTypes: string[];
  workModes: string[];
}) {
  const [v, setV] = useState<AlertInput>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const r = await saveAlerts(v);
    setSaving(false);
    if (r.ok)
      setMsg({
        kind: "ok",
        text: v.enabled
          ? r.welcomeSent
            ? "Saved. We've sent you a welcome email."
            : "Saved. You'll get an email when new matching jobs are posted."
          : "Saved. Alerts are paused.",
      });
    else setMsg({ kind: "err", text: r.error });
  }

  const select = (key: "job_type" | "work_mode", options: string[]) =>
    options.length ? (
      <select className={inputCls} value={v[key]} onChange={(e) => setV({ ...v, [key]: e.target.value })}>
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    ) : (
      <input className={inputCls} value={v[key]} onChange={(e) => setV({ ...v, [key]: e.target.value })} placeholder="Any" />
    );

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight">Job alerts</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Get an email at <strong>{email}</strong> when new jobs match your keywords. We check once a day and only
        email you when there&apos;s something new.
      </p>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={v.enabled}
            onChange={(e) => setV({ ...v, enabled: e.target.checked })}
            className="h-4 w-4 accent-[#0E4A33]"
          />
          Email me new matching jobs
        </label>

        <Field label="Keywords">
          <input
            className={inputCls}
            value={v.keywords}
            onChange={(e) => setV({ ...v, keywords: e.target.value })}
            placeholder="e.g. React, SQL, content writing"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Location">
            <input className={inputCls} value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} placeholder="Any" />
          </Field>
          <Field label="Job type">{select("job_type", jobTypes)}</Field>
          <Field label="Work mode">{select("work_mode", workModes)}</Field>
        </div>

        {msg && (
          <div
            role={msg.kind === "err" ? "alert" : "status"}
            className={`rounded-lg px-3 py-2 text-sm ${msg.kind === "err" ? "border border-red-200 bg-red-50 text-red-800" : "bg-muted"}`}
          >
            {msg.text}
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save alerts"}
        </button>
      </form>
    </div>
  );
}
