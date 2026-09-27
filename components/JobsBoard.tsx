"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { PublicJob } from "@/lib/types";
import JobCard from "@/components/JobCard";
import FilterBar, { emptyFilters, type Filters } from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import EmailSignup from "@/components/EmailSignup";

const LIMIT = 12;

const FILTER_KEYS = [
  "q",
  "job_type",
  "work_mode",
  "exp_level",
  "sort_by",
  "location",
] as const;

function filtersFromSearchParams(sp: URLSearchParams): Filters {
  const out = { ...emptyFilters };
  for (const key of FILTER_KEYS) {
    const v = sp.get(key);
    if (v) out[key] = v;
  }
  return out;
}

export default function JobsBoard({
  initialJobs,
}: {
  initialJobs: PublicJob[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlOffset = useMemo(() => {
    const o = parseInt(searchParams.get("offset") ?? "0", 10);
    return Number.isFinite(o) && o >= 0 ? o : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const urlHasFilters = useMemo(
    () => FILTER_KEYS.some((k) => searchParams.get(k)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [filters, setFiltersState] = useState<Filters>(() =>
    urlHasFilters ? filtersFromSearchParams(searchParams) : emptyFilters
  );
  const [offset, setOffsetState] = useState(urlOffset);
  const [jobs, setJobs] = useState<PublicJob[]>(initialJobs);
  const [total, setTotal] = useState(initialJobs.length);
  const [fetchState, setFetchState] = useState<
    "loading" | "ready" | "error" | "rate_limited"
  >(initialJobs.length > 0 ? "ready" : "loading");
  const [errorMessage, setErrorMessage] = useState("");

  const skipNextFetch = useRef(
    initialJobs.length > 0 && !urlHasFilters && urlOffset === 0
  );

  const syncUrl = useCallback(
    (nextFilters: Filters, nextOffset: number) => {
      const params = new URLSearchParams();
      for (const key of FILTER_KEYS) {
        const v = nextFilters[key];
        if (v && v !== emptyFilters[key]) params.set(key, v);
      }
      if (nextOffset > 0) params.set("offset", String(nextOffset));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const setFilters = useCallback(
    (f: Filters) => {
      setFiltersState(f);
      setOffsetState(0);
      syncUrl(f, 0);
    },
    [syncUrl]
  );

  const setOffset = useCallback(
    (o: number) => {
      setOffsetState(o);
      syncUrl(filters, o);
    },
    [filters, syncUrl]
  );

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    let cancelled = false;

    async function load() {
      setFetchState("loading");

      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(offset),
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      try {
        const res = await fetch(`/api/jobs?${params.toString()}`);
        const body = await res.json();

        if (cancelled) return;

        if (res.status === 429) {
          setFetchState("rate_limited");
          setErrorMessage("Job listings are refreshing — try again in a moment.");
          return;
        }

        if (!body.success) {
          setFetchState("error");
          setErrorMessage(body.error?.message ?? "Couldn't load jobs.");
          return;
        }

        setJobs(body.data.items);
        setTotal(body.data.total);
        setFetchState("ready");
      } catch {
        if (!cancelled) {
          setFetchState("error");
          setErrorMessage("Couldn't reach the server — check your connection.");
        }
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
    filters.location,
    offset,
  ]);

  const isEmpty = fetchState === "ready" && jobs.length === 0;

  return (
    <>
      <div className="max-w-5xl mx-auto px-6 md:px-12 -mt-6">
        <FilterBar value={filters} onChange={setFilters} />
      </div>

      <section className="max-w-5xl mx-auto px-6 md:px-12 py-10">
        {fetchState === "loading" && (
          <div className="space-y-4" aria-live="polite">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="pinned-card p-5 pl-6 h-24 animate-pulse bg-ink/5" />
            ))}
          </div>
        )}

        {fetchState === "error" && (
          <div className="pinned-card p-6 pl-7">
            <p className="font-display text-lg">Couldn't load listings</p>
            <p className="text-sm text-ink/60 mt-1">{errorMessage}</p>
          </div>
        )}

        {fetchState === "rate_limited" && (
          <div className="pinned-card p-6 pl-7">
            <p className="font-display text-lg">One moment</p>
            <p className="text-sm text-ink/60 mt-1">{errorMessage}</p>
          </div>
        )}

        {isEmpty && (
          <div className="pinned-card p-6 pl-7">
            <p className="font-display text-lg">No matches yet</p>
            <p className="text-sm text-ink/60 mt-1">
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

            <Pagination offset={offset} limit={LIMIT} total={total} onChange={setOffset} />
          </>
        )}

        <div className="mt-10 pt-6 border-t border-ink/10">
          <p className="font-display text-lg mb-2">Get new matches by email</p>
          <EmailSignup filters={filters} />
        </div>
        <div className="mt-12 border-t border-ink/10 pt-8">
          <h2 className="font-display text-2xl">About JobNetWork</h2>

          <p className="mt-3 max-w-3xl leading-7 text-ink/70">
            JobNetWork brings jobs, internships and career opportunities
            together in one place for students, freshers, working
            professionals and recent graduates — across tech, sales,
            marketing, finance, healthcare, operations, design, customer
            support and more.
          </p>

          <p className="mt-3 max-w-3xl leading-7 text-ink/70">
            We regularly add remote, hybrid and on-site opportunities from
            different companies and sources, updated in real time, making it
            easier to search, filter and find roles that match your
            interests, skills and experience level — from entry-level and
            internships to senior positions.
          </p>

          <a
            href="/about"
            className="mt-5 inline-block rounded-lg border border-ink/20 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink/5"
          >
            Learn more about JobNetWork
          </a>
        </div>
      </section>
    </>
  );
}
