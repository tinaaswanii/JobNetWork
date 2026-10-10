import type { Metadata } from "next";
import Link from "next/link";
import { getUser, supabaseServer } from "@/lib/auth/server";
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
        <h2 className="mb-2 font-semibold">Upcoming tasks</h2>
        <p className="text-sm text-muted-foreground">
          No upcoming tasks. Interviews and follow-ups you schedule will show up here.
        </p>
      </section>
    </div>
  );
}
