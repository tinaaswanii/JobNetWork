"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { removeSavedJob } from "@/app/dashboard/saved-jobs/actions";
import { formatDate } from "@/lib/applications";
import { ApplicationForm, Dialog } from "./ApplicationForm";
import { markSaved, markTracked } from "@/components/jobs/tracking-store";

export type SavedJob = {
  job_id: string;
  job_title: string | null;
  company_name: string | null;
  job_url: string | null;
  location: string | null;
  created_at: string;
  application_id: string | null;
};

export default function SavedJobsList({ jobs }: { jobs: SavedJob[] }) {
  const router = useRouter();
  const [tracking, setTracking] = useState<SavedJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  async function remove(j: SavedJob) {
    setRemoving(j.job_id);
    setError(null);
    const r = await removeSavedJob(j.job_id);
    setRemoving(null);
    if (r.ok) {
      markSaved(j.job_id, false);
      router.refresh();
    } else setError(r.error);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Saved jobs</h1>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <p className="font-medium">No saved jobs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap &ldquo;Save job&rdquo; on any listing to keep it here.</p>
          <Link href="/jobs" className="mt-4 inline-block rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white">
            Browse jobs
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((j) => (
            <li key={j.job_id} className="rounded-2xl border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{j.job_title ?? "Untitled role"}</div>
                  <div className="text-sm text-muted-foreground">
                    {[j.company_name, j.location].filter(Boolean).join(" · ")}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Saved {formatDate(j.created_at)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {j.job_url && (
                    <a href={j.job_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
                      Apply →
                    </a>
                  )}
                  {j.application_id ? (
                    <Link href={`/dashboard/applications?open=${j.application_id}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
                      View application
                    </Link>
                  ) : (
                    <button onClick={() => setTracking(j)} className="rounded-lg bg-board px-3 py-1.5 text-sm font-semibold text-white">
                      Start tracking
                    </button>
                  )}
                  <button
                    onClick={() => remove(j)}
                    disabled={removing === j.job_id}
                    className="rounded-lg px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    {removing === j.job_id ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tracking && (
        <Dialog title="Track application" onClose={() => setTracking(null)}>
          <ApplicationForm
            editing={null}
            initial={{
              job_id: tracking.job_id,
              company_name: tracking.company_name ?? "",
              job_title: tracking.job_title ?? "",
              job_url: tracking.job_url ?? "",
              location: tracking.location ?? "",
              status: "interested",
            }}
            onCancel={() => setTracking(null)}
            onDone={(r) => {
              if (r.id) markTracked(tracking.job_id, r.id);
              setTracking(null);
              router.refresh();
            }}
          />
        </Dialog>
      )}
    </div>
  );
}
