"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "./ApplicationForm";
import { type AppOption, FollowUpForm, RescheduleFollowUpForm } from "./ScheduleForms";
import { type FollowUp, FOLLOW_UP_TYPE_LABEL, isOverdue } from "@/lib/follow-ups";
import { formatDate } from "@/lib/applications";
import { deleteFollowUp, setFollowUpCompleted } from "@/app/dashboard/follow-ups/actions";

export type FollowUpRow = FollowUp & { application_label: string };

type Modal =
  | { kind: "new" }
  | { kind: "edit" | "reschedule" | "delete"; item: FollowUpRow }
  | null;

export default function FollowUpsManager({
  followUps,
  apps,
  today,
}: {
  followUps: FollowUpRow[];
  apps: AppOption[];
  today: string;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const done = () => {
    setModal(null);
    router.refresh();
  };

  async function toggle(f: FollowUpRow) {
    setBusyId(f.id);
    setError(null);
    const r = await setFollowUpCompleted(f.id, f.status !== "completed");
    setBusyId(null);
    if (r.ok) router.refresh();
    else setError(r.error);
  }

  const byDue = (a: FollowUpRow, b: FollowUpRow) => a.due_date.localeCompare(b.due_date);
  const overdue = followUps.filter((f) => isOverdue(f, today)).sort(byDue);
  const pending = followUps.filter((f) => f.status === "pending" && !isOverdue(f, today)).sort(byDue);
  const completed = followUps
    .filter((f) => f.status === "completed")
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));

  const section = (title: string, items: FollowUpRow[], empty: string, tone?: "red") => (
    <section className="mb-8">
      <h2 className={`mb-2 font-semibold ${tone === "red" ? "text-red-700" : ""}`}>
        {title} <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="rounded-2xl border bg-white p-5 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((f) => (
            <li key={f.id} className={`rounded-2xl border bg-white p-4 ${tone === "red" ? "border-red-200" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <input
                    type="checkbox"
                    checked={f.status === "completed"}
                    disabled={busyId === f.id}
                    onChange={() => toggle(f)}
                    aria-label={f.status === "completed" ? "Mark as pending" : "Mark as done"}
                    className="mt-1 h-4 w-4 accent-[#0E4A33]"
                  />
                  <div className="min-w-0">
                    <div className={`font-medium ${f.status === "completed" ? "text-muted-foreground line-through" : ""}`}>
                      {f.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {f.application_label} · {FOLLOW_UP_TYPE_LABEL[f.follow_up_type]}
                    </div>
                    <div className={`text-sm ${tone === "red" ? "text-red-700" : ""}`}>
                      {f.status === "completed" ? `Done ${formatDate(f.completed_at)}` : `Due ${formatDate(f.due_date)}`}
                    </div>
                    {f.notes && <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{f.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {f.status === "pending" && (
                    <Btn onClick={() => setModal({ kind: "reschedule", item: f })}>Reschedule</Btn>
                  )}
                  <Btn onClick={() => setModal({ kind: "edit", item: f })}>Edit</Btn>
                  <Btn danger onClick={() => setModal({ kind: "delete", item: f })}>
                    Delete
                  </Btn>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Follow-ups</h1>
        <button
          onClick={() => setModal({ kind: "new" })}
          disabled={apps.length === 0}
          className="rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          + Add follow-up
        </button>
      </div>
      {apps.length === 0 && (
        <p className="mb-6 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Add an application first, then you can add follow-ups to it.
        </p>
      )}
      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      {overdue.length > 0 && section("Overdue", overdue, "", "red")}
      {section("Pending", pending, "Nothing pending.")}
      {section("Completed", completed, "Nothing completed yet.")}

      {modal?.kind === "new" && (
        <Dialog title="Add follow-up" onClose={() => setModal(null)}>
          <FollowUpForm apps={apps} onDone={done} onCancel={() => setModal(null)} />
        </Dialog>
      )}
      {modal?.kind === "edit" && (
        <Dialog title="Edit follow-up" onClose={() => setModal(null)}>
          <FollowUpForm apps={apps} editing={modal.item} onDone={done} onCancel={() => setModal(null)} />
        </Dialog>
      )}
      {modal?.kind === "reschedule" && (
        <Dialog title="Reschedule follow-up" onClose={() => setModal(null)}>
          <RescheduleFollowUpForm followUp={modal.item} onDone={done} onCancel={() => setModal(null)} />
        </Dialog>
      )}
      {modal?.kind === "delete" && (
        <DeleteDialog item={modal.item} onCancel={() => setModal(null)} onDone={done} />
      )}
    </div>
  );
}

function Btn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${danger ? "text-red-700 hover:bg-red-50" : "text-board hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}

function DeleteDialog({ item, onCancel, onDone }: { item: FollowUpRow; onCancel: () => void; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function confirm() {
    setBusy(true);
    const r = await deleteFollowUp(item.id);
    setBusy(false);
    if (r.ok) onDone();
    else setErr(r.error);
  }
  return (
    <Dialog title="Delete follow-up?" onClose={onCancel}>
      <p className="text-sm">
        This permanently deletes <strong>{item.title}</strong>.
      </p>
      {err && <div role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{err}</div>}
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
        <button onClick={confirm} disabled={busy} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Dialog>
  );
}
