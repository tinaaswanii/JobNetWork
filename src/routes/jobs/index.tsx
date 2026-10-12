import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import type { JobsPageResult, JobsQuery } from "@/lib/jobs/types";
import { getJobs } from "@/lib/jobs/jobs.functions";
import JobCard from "@/components/jobs/JobCard";
import FilterBar, {
  emptyFilters,
  type Filters,
} from "@/components/jobs/FilterBar";
import Pagination from "@/components/jobs/Pagination";

const LIMIT = 12;

type JobsSearch = {
  q?: string;
  job_type?: string;
  work_mode?: string;
  exp_level?: string;
  sort_by?: string;
  offset?: number;
};

export const Route = createFileRoute("/jobs/")({
  validateSearch: (search: Record<string, unknown>): JobsSearch => {
    const out: JobsSearch = {};
    if (typeof search["q"] === "string") out.q = search["q"];
    if (typeof search["job_type"] === "string") out.job_type = search["job_type"];
    if (typeof search["work_mode"] === "string") out.work_mode = search["work_mode"];
    if (typeof search["exp_level"] === "string") out.exp_level = search["exp_level"];
    if (typeof search["sort_by"] === "string") out.sort_by = search["sort_by"];
    if (typeof search["offset"] === "number" && search["offset"] >= 0)
      out.offset = search["offset"];
    return out;
  },
  loader: () =>
    getJobs({ data: { limit: LIMIT, offset: 0, sort_by: "newest" } }).catch(
      (): JobsPageResult => ({
        items: [],
        total: 0,
        limit: LIMIT,
        offset: 0,
        has_more: false,
      }),
    ),
  head: () => ({
    meta: [
      { title: "Browse Jobs & Internships | JobNetWork" },
      {
        name: "description",
        content:
          "Search the latest jobs and internships. Filter by role, job type, work mode and experience level, from entry-level to senior positions.",
      },
      { property: "og:title", content: "Browse Jobs & Internships | JobNetWork" },
      {
        property: "og:description",
        content:
          "Search the latest jobs and internships. Filter by role, job type, work mode and experience level.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const initial = Route.useLoaderData();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-10 md:px-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Browse jobs & internships
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {initial.total > 0
              ? `${initial.total.toLocaleString("en-IN")} openings right now. `
              : ""}
            Filter by role, job type, work mode and experience level. New
            openings are added regularly.
          </p>
        </div>
      </header>

      <JobsBoard initialJobs={initial.items} initialTotal={initial.total} />
    </main>
  );
}

function JobsBoard({
  initialJobs,
  initialTotal,
}: {
  initialJobs: JobsPageResult["items"];
  initialTotal: number;
}) {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [filters, setFiltersState] = useState<Filters>(() => ({
    ...emptyFilters,
    q: search.q ?? "",
    job_type: search.job_type ?? "",
    work_mode: search.work_mode ?? "",
    exp_level: search.exp_level ?? "",
    sort_by: search.sort_by ?? "newest",
  }));
  const [offset, setOffsetState] = useState(search.offset ?? 0);
  const [jobs, setJobs] = useState(initialJobs);
  const [total, setTotal] = useState(initialTotal);
  const [fetchState, setFetchState] = useState<
    "loading" | "ready" | "error"
  >(initialJobs.length > 0 ? "ready" : "loading");
  const [errorMessage, setErrorMessage] = useState("");

  const syncUrl = useCallback(
    (nextFilters: Filters, nextOffset: number) => {
      const search: JobsSearch = {};
      if (nextFilters.q) search.q = nextFilters.q;
      if (nextFilters.job_type) search.job_type = nextFilters.job_type;
      if (nextFilters.work_mode) search.work_mode = nextFilters.work_mode;
      if (nextFilters.exp_level) search.exp_level = nextFilters.exp_level;
      if (nextFilters.sort_by !== "newest") search.sort_by = nextFilters.sort_by;
      if (nextOffset > 0) search.offset = nextOffset;
      navigate({ to: "/jobs", replace: true, search });
    },
    [navigate],
  );

  const setFilters = useCallback(
    (f: Filters) => {
      setFiltersState(f);
      setOffsetState(0);
      syncUrl(f, 0);
    },
    [syncUrl],
  );

  const setOffset = useCallback(
    (o: number) => {
      setOffsetState(o);
      syncUrl(filters, o);
    },
    [filters, syncUrl],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setFetchState("loading");
      try {
        const query: JobsQuery = {
          limit: LIMIT,
          offset,
          sort_by: (filters.sort_by || "newest") as
            | "most_relevant"
            | "newest"
            | "high_cpa",
        };
        if (filters.q) query.q = filters.q;
        if (filters.job_type) query.job_type = filters.job_type;
        if (filters.work_mode) query.work_mode = filters.work_mode;
        if (filters.exp_level) query.exp_level = filters.exp_level;
        const result = await getJobs({ data: query });
        if (cancelled) return;
        setJobs(result.items);
        setTotal(result.total);
        setFetchState("ready");
      } catch (err) {
        if (cancelled) return;
        setFetchState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Couldn't load jobs.",
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [
    filters.q,
    filters.job_type,
    filters.work_mode,
    filters.exp_level,
    filters.sort_by,
    offset,
  ]);

  const isEmpty = fetchState === "ready" && jobs.length === 0;

  return (
    <>
      <div className="mx-auto -mt-6 max-w-5xl px-6 md:px-12">
        <FilterBar value={filters} onChange={setFilters} />
      </div>

      <section className="mx-auto max-w-5xl px-6 py-10 md:px-12">
        {fetchState === "loading" && (
          <div className="space-y-4" aria-live="polite">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="pinned-card h-24 animate-pulse bg-muted p-5"
              />
            ))}
          </div>
        )}

        {fetchState === "error" && (
          <div className="pinned-card p-6">
            <p className="text-lg font-semibold">Couldn't load listings</p>
            <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
          </div>
        )}

        {isEmpty && (
          <div className="pinned-card p-6">
            <p className="text-lg font-semibold">No matches yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try widening a filter, or clear your search to see everything.
            </p>
          </div>
        )}

        {fetchState === "ready" && !isEmpty && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            <Pagination
              offset={offset}
              limit={LIMIT}
              total={total}
              onChange={setOffset}
            />
          </>
        )}

        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold">About JobNetWork</h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            JobNetWork brings jobs, internships and career opportunities
            together in one place for students, freshers, working professionals
            and recent graduates — across tech, sales, marketing, finance,
            healthcare, operations, design, customer support and more.
          </p>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            Sign in to save any listing to your private tracker and follow it
            through every stage — from saved to offer.
          </p>
        </div>
      </section>
    </>
  );
}
