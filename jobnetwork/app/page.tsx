"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicJob } from "@/lib/types";
import JobCard from "@/components/JobCard";
import FilterBar, { emptyFilters, type Filters } from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import EmailSignup from "@/components/EmailSignup";

const LIMIT = 12;
// How many jobs to pull from the server in one go, so client-side search
// actually has a real pool to search over — not just the current page.
const FETCH_POOL_SIZE = 50;

export default function JobsPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [offset, setOffset] = useState(0);
  const [allJobs, setAllJobs] = useState<PublicJob[]>([]);
  const [fetchState, setFetchState] = useState<"loading" | "ready" | "error" | "rate_limited">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Reset to page 1 whenever ANY filter changes, including the search text.
    useEffect(() => {
    let cancelled = false;

    async function load() {
      setFetchState("loading");

      const params = new URLSearchParams({
        limit: String(FETCH_POOL_SIZE),
        offset: "0",
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
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

        setAllJobs(body.data.items);
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
  ]);
  // Client-side text search over whatever's already in the UI.
  const filteredJobs = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    if (!q) return allJobs;
    return allJobs.filter((job) => {
      const haystack = [job.title, job.company, job.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [allJobs, filters.q]);

  const pageJobs = filteredJobs.slice(offset, offset + LIMIT);
  const total = filteredJobs.length;
  const isEmpty = fetchState === "ready" && filteredJobs.length === 0;

  return (
    <main className="min-h-screen bg-paper">
      <header className="bg-board text-paper px-6 py-10 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <img
              src="/Logo.png"
              alt="JobNetWork"
              className="w-20 h-20 object-contain rounded-full bg-white"
            />
            <h1 className="font-display text-3xl md:text-4xl">JobNetWork</h1>
          </div>
          <p className="text-paper/80 max-w-md">
            Internships, jobs, and placement resources for students, working
            professionals or recent grads all at one place updated in real time.
          </p>
        </div><div className="mt-4 inline-flex items-center rounded-lg border border-paper/20 bg-paper/10 px-3 py-2 text-sm text-paper/90">
  No registration fees to access JobNetWork listings.
</div>
      </header>

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
            <div className="grid gap-4 md:grid-cols-2">
              {pageJobs.map((job) => (
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
      </section>
    </main>
  );
}
