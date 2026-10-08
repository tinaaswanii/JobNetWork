import type { Metadata } from "next";
import { Suspense } from "react";
import { getJobsPage } from "@/lib/jobs";
import JobsBoard, { LIMIT } from "@/components/JobsBoard";

export const revalidate = 300;

const SITE_URL = "https://job-net-work.vercel.app";

export const metadata: Metadata = {
  title: "Browse Jobs & Internships in India",
  description:
    "Search the latest jobs and internships in India. Filter by role, job type, work mode and experience level, from entry-level to senior positions.",
  alternates: { canonical: `${SITE_URL}/jobs` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/jobs`,
    siteName: "JobNetWork",
    title: "Browse Jobs & Internships in India | JobNetWork",
    description:
      "Search the latest jobs and internships. Filter by role, job type, work mode and experience level.",
  },
};

export default async function JobsPage() {
  const initial = await getJobsPage({
    limit: LIMIT,
    offset: 0,
    sort_by: "newest",
  }).catch(() => ({
    items: [],
    total: 0,
    limit: LIMIT,
    offset: 0,
    has_more: false,
  }));

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b bg-white px-6 py-10 md:px-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl">Browse jobs & internships</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {initial.total > 0
              ? `${initial.total.toLocaleString("en-IN")} openings right now. `
              : ""}
            Filter by role, job type, work mode and experience level. New
            openings are added regularly.
          </p>
        </div>
      </header>

      <Suspense fallback={null}>
        <JobsBoard initialJobs={initial.items} />
      </Suspense>
    </main>
  );
}
