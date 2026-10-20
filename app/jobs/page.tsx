import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getJobsPage } from "@/lib/jobs";
import { buildJobsQuery, filtersFromParams, JOBS_PAGE_SIZE as LIMIT, offsetFromParams } from "@/lib/jobs-query";
import JobsBoard from "@/components/JobsBoard";

export const metadata: Metadata = pageMetadata({
  title: "Browse Jobs & Internships in India | JobNetWork",
  absoluteTitle: true,
  description:
    "Search the latest jobs and internships in India. Filter by role, job type, work mode and experience level, from entry-level to senior positions.",
  path: "/jobs",
  ogDescription:
    "Search the latest jobs and internships. Filter by role, job type, work mode and experience level.",
});

// Rendered on the server for the URL's own filters and page, so crawlers and
// slow devices get real job cards in the HTML. (Reading searchParams makes this
// route dynamic; the Artha fetch itself is still cached for 60s in lib/artha.)
export default async function JobsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const flat = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    const first = Array.isArray(v) ? v[0] : v;
    if (first) flat.set(k, first);
  }
  const initialFilters = filtersFromParams(flat);
  const initialOffset = offsetFromParams(flat);

  const initial = await getJobsPage(buildJobsQuery(initialFilters, initialOffset, LIMIT)).catch(() => ({
    items: [],
    total: 0,
    limit: LIMIT,
    offset: initialOffset,
    has_more: false,
    sources: { artha: "unavailable" as const },
  }));

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-paper">
      <header className="border-b bg-white px-6 py-10 md:px-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl">Jobs & internships in India</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            From internships and first jobs to experienced and senior roles,
            updated in real time. Filter by type, work mode and experience.
          </p>
        </div>
      </header>

      <JobsBoard
        initialJobs={initial.items}
        initialTotal={initial.total}
        initialSources={initial.sources}
        initialFilters={initialFilters}
        initialOffset={initialOffset}
        jobHeadingLevel={2}
      />
    </main>
  );
}
