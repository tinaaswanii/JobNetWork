"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/auth/client";
import { Dialog } from "./ApplicationForm";
import { FollowUpForm, InterviewForm } from "./ScheduleForms";
import { type Interview, INTERVIEW_TYPE_LABEL, OUTCOME_LABEL } from "@/lib/interviews";
import { type FollowUp, FOLLOW_UP_TYPE_LABEL, isOverdue } from "@/lib/follow-ups";
import { formatDate } from "@/lib/applications";
import { formatInZone, todayIST } from "@/lib/datetime";

type Activity = { id: string; activity_type: string; description: string | null; created_at: string };

/**
 * Interviews, follow-ups and history for one application, shown on its detail
 * view. Reads use the browser client (RLS = own rows only); writes reuse the
 * same server actions as the dedicated pages.
 */
export default function ApplicationTimeline({ applicationId, label }: { applicationId: string; label: string }) {
  const [data, setData] = useState<{ interviews: Interview[]; followUps: FollowUp[]; activities: Activity[] } | null>(null);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<"interview" | "followup" | null>(null);

  const load = useCallback(async () => {
    const sb = supabaseBrowser();
    const [i, f, a] = await Promise.all([
      sb.from("interviews").select("*").eq("application_id", applicationId).order("scheduled_at", { ascending: true }),
      sb.from("follow_ups").select("*").eq("application_id", applicationId).order("due_date", { ascending: true }),
      sb
        .from("application_activities")
        .select("id, activity_type, description, created_at")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false }),
    ]);
    if (i.error || f.error || a.error) return setError(true);
    setError(false);
    setData({ interviews: (i.data ?? []) as Interview[], followUps: (f.data ?? []) as FollowUp[], activities: (a.data ?? []) as Activity[] });
  }, [applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  const done = () => {
    setModal(null);
    load();
  };
  const today = todayIST();
  const apps = [{ id: applicationId, label }];

  return (
    <div className="mt-6 space-y-5 border-t pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Interviews &amp; follow-ups</h3>
        <div className="flex gap-2">
          <button onClick={() => setModal("interview")} className="rounded-lg border px-3 py-1 text-xs font-medium hover:bg-muted">
            + Interview
          </button>
          <button onClick={() => setModal("followup")} className="rounded-lg border px-3 py-1 text-xs font-medium hover:bg-muted">
            + Follow-up
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">Couldn&apos;t load interviews and follow-ups.</p>}
      {!data && !error && <p className="text-sm text-muted-foreground">Loading…</p>}

      {data && (
        <>
          <ul className="space-y-2 text-sm">
            {data.interviews.length === 0 && data.followUps.length === 0 && (
              <li className="text-muted-foreground">Nothing scheduled yet.</li>
            )}
            {data.interviews.map((i) => (
              <li key={i.id} className="rounded-lg bg-muted/60 p-3">
                <div className="font-medium">
                  {[i.round, INTERVIEW_TYPE_LABEL[i.interview_type]].filter(Boolean).join(" · ")}
                  {i.status === "completed" && (
                    <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-medium">{OUTCOME_LABEL[i.outcome]}</span>
                  )}
                </div>
                <div className="text-muted-foreground">{formatInZone(i.scheduled_at, i.timezone)}</div>
                {i.feedback && <p className="mt-1 whitespace-pre-wrap">{i.feedback}</p>}
              </li>
            ))}
            {data.followUps.map((f) => (
              <li key={f.id} className="rounded-lg bg-muted/60 p-3">
                <div className={`font-medium ${f.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{f.title}</div>
                <div className={isOverdue(f, today) ? "text-red-700" : "text-muted-foreground"}>
                  {FOLLOW_UP_TYPE_LABEL[f.follow_up_type]} ·{" "}
                  {f.status === "completed" ? `Done ${formatDate(f.completed_at)}` : `${isOverdue(f, today) ? "Overdue — " : "Due "}${formatDate(f.due_date)}`}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Edit, reschedule or complete on the{" "}
            <Link href="/dashboard/interviews" className="underline">Interviews</Link> and{" "}
            <Link href="/dashboard/follow-ups" className="underline">Follow-ups</Link> pages.
          </p>

          <div>
            <h3 className="mb-2 text-sm font-semibold">History</h3>
            {data.activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {data.activities.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="w-24 shrink-0 text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
                    <span>{a.description ?? a.activity_type}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {modal === "interview" && (
        <Dialog title="Schedule interview" onClose={() => setModal(null)}>
          <InterviewForm apps={apps} fixedApplicationId={applicationId} onDone={done} onCancel={() => setModal(null)} />
        </Dialog>
      )}
      {modal === "followup" && (
        <Dialog title="Add follow-up" onClose={() => setModal(null)}>
          <FollowUpForm apps={apps} fixedApplicationId={applicationId} onDone={done} onCancel={() => setModal(null)} />
        </Dialog>
      )}
    </div>
  );
}
