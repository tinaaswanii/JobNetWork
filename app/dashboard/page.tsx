import type { Metadata } from "next";
import Link from "next/link";
import { getUser, supabaseServer } from "@/lib/auth/server";
import { formatInZone, todayIST } from "@/lib/datetime";
import { isOverdue } from "@/lib/follow-ups";
import {
  type Application,
  STATUSES,
  STATUS_BADGE,
  STATUS_BAR,
  STATUS_LABEL,
  computeMetrics,
  formatDate,
} from "@/lib/applications";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await getUser();
  const supabase = supabaseServer();
  // RLS limits this to the signed-in user's rows.
  const { data, error } = await supabase
    .from("applications")
    .select("id, company_name, job_title, status, applied_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  const today = todayIST();
  const [ints, fus] = await Promise.all([
    supabase
      .from("interviews")
      .select("id, scheduled_at, timezone, round, applications(company_name, job_title)")
      .eq("status", "scheduled")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5),
    supabase
      .from("follow_ups")
      .select("id, title, due_date, status, applications(company_name, job_title)")
      .eq("status", "pending")
      .order("due_date", { ascending: true })
      .limit(5),
  ]);
  // Supabase types a to-one embed as an array; normalise to one object.
  const one = <T,>(v: T | T[] | null | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  const upcomingInterviews = (ints.data ?? []) as unknown as {
    id: string; scheduled_at: string; timezone: string; round: string | null;
    applications: { company_name: string; job_title: string } | { company_name: string; job_title: string }[] | null;
  }[];
  const pendingFollowUps = (fus.data ?? []) as unknown as {
    id: string; title: string; due_date: string; status: "pending";
    applications: { company_name: string; job_title: string } | { company_name: string; job_title: string }[] | null;
  }[];

  const apps = (data ?? []) as Pick<
    Application,
    "id" | "company_name" | "job_title" | "status" | "applied_at" | "updated_at"
  >[];
  const m = computeMetrics(apps);
  const recent = apps.slice(0, 5);
  const first = ((user?.user_metadata?.full_name as string | undefined) ?? "").split(" ")[0];

  const cards = [
    { label: "Total applications", value: String(m.total) },
    { label: "Interviews", value: String(m.interviews) },
    { label: "Offers", value: String(m.offers) },
    { label: "Response rate", value: m.responseRate === null ? "—" : `${m.responseRate}%` },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {first ? `Hi, ${first}` : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here&apos;s where your job search stands.</p>
        </div>
        <Link
          href="/dashboard/applications?new=1"
          className="rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b3a28]"
        >
          + Add application
        </Link>
      </div>

      <section aria-label="Summary" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border bg-white p-5">
            <div className="text-3xl font-bold tracking-tight">{c.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </section>
      {m.responseRate !== null && (
        <p className="-mt-5 text-xs text-muted-foreground">
          Response rate = applications that got a reply (assessment, interview, offer or rejection) ÷
          applications you&apos;ve submitted.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-5">
        <section className="rounded-2xl border bg-white p-5 md:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent applications</h2>
            {apps.length > 0 && (
              <Link href="/dashboard/applications" className="text-sm text-board hover:underline">
                View all
              </Link>
            )}
          </div>
          {recent.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No applications yet.{" "}
              <Link href="/dashboard/applications?new=1" className="font-medium text-board underline">
                Add your first one
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{a.job_title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {a.company_name} · {formatDate(a.applied_at ?? a.updated_at)}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[a.status]}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-5 md:col-span-2">
          <h2 className="mb-3 font-semibold">Status breakdown</h2>
          {m.total === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">Nothing to show yet.</p>
          ) : (
            <ul className="space-y-3">
              {STATUSES.map((s) => (
                <li key={s}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{STATUS_LABEL[s]}</span>
                    <span className="text-muted-foreground">{m.byStatus[s]}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${STATUS_BAR[s]}`}
                      style={{ width: `${(m.byStatus[s] / m.total) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border bg-white p-5">
        <h2 className="mb-3 font-semibold">Upcoming tasks</h2>
        {upcomingInterviews.length === 0 && pendingFollowUps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming tasks. Interviews and follow-ups you schedule will show up here.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Interviews</span>
                <Link href="/dashboard/interviews" className="text-board hover:underline">View all</Link>
              </div>
              {upcomingInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">None scheduled.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {upcomingInterviews.map((i) => {
                    const app = one(i.applications);
                    return (
                      <li key={i.id}>
                        <div className="font-medium">{app ? `${app.job_title} — ${app.company_name}` : "Interview"}</div>
                        <div className="text-muted-foreground">
                          {formatInZone(i.scheduled_at, i.timezone)}{i.round ? ` · ${i.round}` : ""}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Follow-ups</span>
                <Link href="/dashboard/follow-ups" className="text-board hover:underline">View all</Link>
              </div>
              {pendingFollowUps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing pending.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {pendingFollowUps.map((f) => {
                    const app = one(f.applications);
                    const late = isOverdue(f, today);
                    return (
                      <li key={f.id}>
                        <div className="font-medium">{f.title}</div>
                        <div className={late ? "text-red-700" : "text-muted-foreground"}>
                          {late ? "Overdue — " : "Due "}{formatDate(f.due_date)}{app ? ` · ${app.company_name}` : ""}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
