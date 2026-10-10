"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "./ApplicationForm";
import {
  type AppOption,
  CompleteInterviewForm,
  InterviewForm,
  RescheduleInterviewForm,
} from "./ScheduleForms";
import { type Interview, INTERVIEW_TYPE_LABEL, OUTCOME_LABEL } from "@/lib/interviews";
import { formatInZone } from "@/lib/datetime";
import { deleteInterview } from "@/app/dashboard/interviews/actions";

export type InterviewRow = Interview & { application_label: string };

type Modal =
  | { kind: "new" }
  | { kind: "edit" | "reschedule" | "complete" | "delete"; interview: InterviewRow }
  | null;

export default function InterviewsManager({
  interviews,
  apps,
  nowIso,
}: {
  interviews: InterviewRow[];
  apps: AppOption[];
  nowIso: string;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const done = () => {
    setModal(null);
    router.refresh();
  };

  const now = Date.parse(nowIso);
  const scheduled = interviews.filter((i) => i.status === "scheduled");
  const upcoming = scheduled.filter((i) => Date.parse(i.scheduled_at) >= now).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const needsUpdate = scheduled.filter((i) => Date.parse(i.scheduled_at) < now).sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));
  const completed = interviews.filter((i) => i.status === "completed").sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>
        <button
          onClick={() => setModal({ kind: "new" })}
          disabled={apps.length === 0}
          className="rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          + Schedule interview
        </button>
      </div>

      {apps.length === 0 && (
        <p className="mb-6 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Add an application first, then you can schedule interviews against it.
        </p>
      )}

      <Section title="Upcoming" empty="No upcoming interviews." items={upcoming} setModal={setModal} />
      {needsUpdate.length > 0 && (
        <Section title="Past — needs an update" items={needsUpdate} setModal={setModal} hint="These have passed. Mark them complete or reschedule." />
      )}
      <Section title="Completed" empty="Nothing completed yet." items={completed} setModal={setModal} />

      {modal?.kind === "new" && (
        <Dialog title="Schedule interview" onClose={() => setModal(null)}>
          <InterviewForm apps={apps} onDone={done} onCancel={() => setModal(null)} />
        </Dialog>
      )}
      {modal?.kind === "edit" && (
        <Dialog title="Edit interview" onClose={() => setModal(null)}>
          <InterviewForm apps={apps} editing={modal.interview} onDone={done} onCancel={() => setModal(null)} />
        </Dialog>
      )}
      {modal?.kind === "reschedule" && (
        <Dialog title="Reschedule interview" onClose={() => setModal(null)}>
          <RescheduleInterviewForm interview={modal.interview} onDone={done} onCancel={() => setModal(null)} />
        </Dialog>
      )}
      {modal?.kind === "complete" && (
        <Dialog title="Mark interview complete" onClose={() => setModal(null)}>
          <CompleteInterviewForm interview={modal.interview} onDone={done} onCancel={() => setModal(null)} />
        </Dialog>
      )}
      {modal?.kind === "delete" && (
        <DeleteDialog interview={modal.interview} onCancel={() => setModal(null)} onDone={done} />
      )}
    </div>
  );
}

function Section({
  title,
  items,
  empty,
  hint,
  setModal,
}: {
  title: string;
  items: InterviewRow[];
  empty?: string;
  hint?: string;
  setModal: (m: Modal) => void;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-1 font-semibold">
        {title} <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
      </h2>
      {hint && <p className="mb-3 text-xs text-muted-foreground">{hint}</p>}
      {items.length === 0 ? (
        <p className="rounded-2xl border bg-white p-5 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {items.map((i) => (
            <li key={i.id} className="rounded-2xl border bg-white p-4">
              <InterviewItem i={i} setModal={setModal} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function InterviewItem({ i, setModal }: { i: InterviewRow; setModal: (m: Modal) => void }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="font-medium">{i.application_label}</div>
        <div className="text-sm">
          {formatInZone(i.scheduled_at, i.timezone)}
          <span className="text-muted-foreground">
            {" · "}
            {[i.round, INTERVIEW_TYPE_LABEL[i.interview_type]].filter(Boolean).join(" · ")}
          </span>
        </div>
        {i.meeting_url && (
          <a href={i.meeting_url} target="_blank" rel="noopener noreferrer" className="text-sm text-board underline">
            Join link
          </a>
        )}
        {i.prep_notes && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{i.prep_notes}</p>}
        {i.status === "completed" && (
          <div className="mt-2 text-sm">
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{OUTCOME_LABEL[i.outcome]}</span>
            {i.feedback && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{i.feedback}</p>}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {i.status === "scheduled" && (
          <>
            <ActionBtn onClick={() => setModal({ kind: "complete", interview: i })}>Mark complete</ActionBtn>
            <ActionBtn onClick={() => setModal({ kind: "reschedule", interview: i })}>Reschedule</ActionBtn>
          </>
        )}
        <ActionBtn onClick={() => setModal({ kind: "edit", interview: i })}>Edit</ActionBtn>
        <ActionBtn danger onClick={() => setModal({ kind: "delete", interview: i })}>
          Delete
        </ActionBtn>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${danger ? "text-red-700 hover:bg-red-50" : "text-board hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}

function DeleteDialog({ interview, onCancel, onDone }: { interview: InterviewRow; onCancel: () => void; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function confirm() {
    setBusy(true);
    const r = await deleteInterview(interview.id);
    setBusy(false);
    if (r.ok) onDone();
    else setErr(r.error);
  }
  return (
    <Dialog title="Delete interview?" onClose={onCancel}>
      <p className="text-sm">
        This permanently deletes the interview for <strong>{interview.application_label}</strong>.
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
