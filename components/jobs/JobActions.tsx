"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { removeSavedJob, saveJob } from "@/app/dashboard/saved-jobs/actions";
import { ApplicationForm, Dialog } from "@/components/dashboard/ApplicationForm";
import { markSaved, markTracked, useTracking } from "./tracking-store";

export type JobActionsJob = {
  job_id: string; // PublicJob.slug (artha slug or own-job uuid)
  title: string;
  company: string;
  location: string | null;
  url: string;
  job_type: string | null;
};

const btn =
  "inline-block rounded-lg border px-4 py-2 text-sm font-medium text-ink transition hover:bg-muted disabled:opacity-60";

function today() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function JobActions({ job }: { job: JobActionsJob }) {
  const t = useTracking();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const ready = t.status === "ready";
  const saved = t.saved.has(job.job_id);
  const appId = t.apps.get(job.job_id);

  function requireLogin() {
    const here = window.location.pathname + window.location.search;
    router.push(`/login?next=${encodeURIComponent(here)}`);
  }

  async function toggleSave() {
    if (!t.signedIn) return requireLogin();
    setBusy(true);
    setMsg(null);
    const r = saved
      ? await removeSavedJob(job.job_id)
      : await saveJob({
          job_id: job.job_id,
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
        });
    setBusy(false);
    if (r.ok) markSaved(job.job_id, !saved);
    else setMsg(r.error);
  }

  return (
    <>
      <button type="button" onClick={toggleSave} disabled={!ready || busy} className={btn} aria-pressed={saved}>
        {saved ? "Saved ✓" : "Save job"}
      </button>

      {appId ? (
        <Link href={`/dashboard/applications?open=${appId}`} className={btn}>
          View application
        </Link>
      ) : (
        <button
          type="button"
          disabled={!ready}
          onClick={() => (t.signedIn ? setOpen(true) : requireLogin())}
          className={btn}
        >
          Track application
        </button>
      )}

      {msg && (
        <span role="alert" className="basis-full text-xs text-red-700">
          {msg}
        </span>
      )}

      {open && (
        <Dialog title="Track application" onClose={() => setOpen(false)}>
          <ApplicationForm
            editing={null}
            initial={{
              job_id: job.job_id,
              company_name: job.company,
              job_title: job.title,
              job_url: job.url,
              location: job.location ?? "",
              employment_type: job.job_type ? job.job_type.replace("-", " ") : "",
              status: "applied",
              applied_at: today(),
            }}
            onCancel={() => setOpen(false)}
            onDone={(r) => {
              if (r.id) markTracked(job.job_id, r.id);
              setOpen(false);
            }}
          />
        </Dialog>
      )}
    </>
  );
}
