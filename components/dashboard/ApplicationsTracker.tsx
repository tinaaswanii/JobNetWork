"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  type Application,
  type ApplicationInput,
  type FieldErrors,
  STATUSES,
  STATUS_BADGE,
  STATUS_LABEL,
  WORK_MODES,
  formatDate,
  validateApplication,
} from "@/lib/applications";
import {
  createApplication,
  deleteApplication,
  setApplicationStatus,
  updateApplication,
} from "@/app/dashboard/applications/actions";

const EMPTY: ApplicationInput = {
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

const toInput = (a: Application): ApplicationInput => ({
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

type Modal =
  | { kind: "form"; editing: Application | null }
  | { kind: "view"; app: Application }
  | { kind: "delete"; app: Application }
  | null;

const inputCls =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-board focus:ring-1 focus:ring-board";

export default function ApplicationsTracker({
  applications,
  openNew,
}: {
  applications: Application[];
  openNew: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState<Modal>(openNew ? { kind: "form", editing: null } : null);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter(
      (a) =>
        (statusFilter === "all" || a.status === statusFilter) &&
        (!q || a.company_name.toLowerCase().includes(q) || a.job_title.toLowerCase().includes(q))
    );
  }, [applications, query, statusFilter]);

  function close() {
    setModal(null);
    // Drop ?new=1 so a refresh doesn't reopen the form.
    if (openNew) router.replace("/dashboard/applications");
  }

  function changeStatus(a: Application, status: string) {
    setToast(null);
    startTransition(async () => {
      const r = await setApplicationStatus(a.id, status);
      if (!r.ok) setToast(r.error);
      else router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <button
          onClick={() => setModal({ kind: "form", editing: null })}
          className="rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b3a28]"
        >
          + Add application
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or job title"
          aria-label="Search applications"
          className={`${inputCls} sm:max-w-xs`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className={`${inputCls} sm:w-48`}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {toast && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {toast}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <p className="font-medium">No applications yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Track roles you&apos;re interested in or have applied to.
          </p>
          <button
            onClick={() => setModal({ kind: "form", editing: null })}
            className="mt-4 rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white"
          >
            Add your first application
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-muted-foreground">
          No applications match your search.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className={`hidden overflow-x-auto rounded-2xl border bg-white md:block ${pending ? "opacity-70" : ""}`}>
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Job title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                  <th className="px-4 py-3 font-medium">Last updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      <button onClick={() => setModal({ kind: "view", app: a })} className="text-left hover:underline">
                        {a.company_name}
                      </button>
                    </td>
                    <td className="px-4 py-3">{a.job_title}</td>
                    <td className="px-4 py-3">
                      <StatusSelect a={a} onChange={changeStatus} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(a.applied_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(a.updated_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <RowActions a={a} setModal={setModal} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className={`space-y-3 md:hidden ${pending ? "opacity-70" : ""}`}>
            {filtered.map((a) => (
              <li key={a.id} className="rounded-2xl border bg-white p-4">
                <button onClick={() => setModal({ kind: "view", app: a })} className="block w-full text-left">
                  <div className="font-medium">{a.job_title}</div>
                  <div className="text-sm text-muted-foreground">{a.company_name}</div>
                </button>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <StatusSelect a={a} onChange={changeStatus} />
                  <RowActions a={a} setModal={setModal} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Applied {formatDate(a.applied_at)} · Updated {formatDate(a.updated_at)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {modal?.kind === "form" && (
        <Dialog title={modal.editing ? "Edit application" : "Add application"} onClose={close}>
          <ApplicationForm
            editing={modal.editing}
            onDone={() => {
              close();
              router.refresh();
            }}
            onCancel={close}
          />
        </Dialog>
      )}

      {modal?.kind === "view" && (
        <Dialog title={modal.app.job_title} onClose={close}>
          <ApplicationDetails
            a={modal.app}
            onEdit={() => setModal({ kind: "form", editing: modal.app })}
            onDelete={() => setModal({ kind: "delete", app: modal.app })}
          />
        </Dialog>
      )}

      {modal?.kind === "delete" && (
        <DeleteConfirm
          app={modal.app}
          onCancel={close}
          onDone={() => {
            close();
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function StatusSelect({ a, onChange }: { a: Application; onChange: (a: Application, s: string) => void }) {
  return (
    <select
      value={a.status}
      onChange={(e) => onChange(a, e.target.value)}
      aria-label={`Status for ${a.job_title} at ${a.company_name}`}
      className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[a.status]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

function RowActions({ a, setModal }: { a: Application; setModal: (m: Modal) => void }) {
  return (
    <span className="inline-flex gap-1">
      <button
        onClick={() => setModal({ kind: "form", editing: a })}
        className="rounded-lg px-2.5 py-1 text-xs font-medium text-board hover:bg-muted"
      >
        Edit
      </button>
      <button
        onClick={() => setModal({ kind: "delete", app: a })}
        className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
      >
        Delete
      </button>
    </span>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
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
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

function ApplicationForm({
  editing,
  onDone,
  onCancel,
}: {
  editing: Application | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<ApplicationInput>(editing ? toInput(editing) : EMPTY);
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
    if (r.ok) return onDone();
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

function ApplicationDetails({ a, onEdit, onDelete }: { a: Application; onEdit: () => void; onDelete: () => void }) {
  const rows: [string, React.ReactNode][] = [
    ["Company", a.company_name],
    ["Status", <span key="s" className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[a.status]}`}>{STATUS_LABEL[a.status]}</span>],
    ["Applied", formatDate(a.applied_at)],
    ["Location", a.location || "—"],
    ["Work mode", a.work_mode ? a.work_mode[0].toUpperCase() + a.work_mode.slice(1) : "—"],
    ["Employment type", a.employment_type || "—"],
    [
      "Job link",
      a.job_url ? (
        <a key="u" href={a.job_url} target="_blank" rel="noopener noreferrer" className="break-all text-board underline">
          {a.job_url}
        </a>
      ) : (
        "—"
      ),
    ],
    ["Last updated", formatDate(a.updated_at)],
  ];
  return (
    <div>
      <dl className="space-y-2 text-sm">
        {rows.map(([k, val]) => (
          <div key={k} className="flex gap-4">
            <dt className="w-32 shrink-0 text-muted-foreground">{k}</dt>
            <dd>{val}</dd>
          </div>
        ))}
      </dl>
      {a.notes && (
        <div className="mt-4">
          <div className="mb-1 text-sm text-muted-foreground">Notes</div>
          <p className="whitespace-pre-wrap rounded-lg bg-muted/60 p-3 text-sm">{a.notes}</p>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onDelete} className="rounded-lg border px-4 py-2 text-sm text-red-700">
          Delete
        </button>
        <button onClick={onEdit} className="rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white">
          Edit
        </button>
      </div>
    </div>
  );
}

function DeleteConfirm({ app, onCancel, onDone }: { app: Application; onCancel: () => void; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    const r = await deleteApplication(app.id);
    setBusy(false);
    if (r.ok) onDone();
    else setError(r.error);
  }

  return (
    <Dialog title="Delete application?" onClose={onCancel}>
      <p className="text-sm">
        This permanently deletes <strong>{app.job_title}</strong> at <strong>{app.company_name}</strong> and
        its activity history. This can&apos;t be undone.
      </p>
      {error && (
        <div role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm">
          Cancel
        </button>
        <button
          onClick={confirm}
          disabled={busy}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Dialog>
  );
}
