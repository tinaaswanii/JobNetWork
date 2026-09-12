"use client";

import { useEffect, useState } from "react";
import type { PublicJob } from "@/lib/types";
import JobCard from "@/components/JobCard";
import FilterBar, { emptyFilters, type Filters } from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import EmailSignup from "@/components/EmailSignup";

const LIMIT = 12;

export default function JobsPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [offset, setOffset] = useState(0);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error" | "rate_limited">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setOffset(0);
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState("loading");
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(offset) });
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });

      try {
        const res = await fetch(`/api/jobs?${params.toString()}`);
        const body = await res.json();

        if (cancelled) return;

        if (res.status === 429) {
          setState("rate_limited");
          setErrorMessage("Job listings are refreshing — try again in a moment.");
          return;
        }
        if (!body.success) {
          setState("error");
          setErrorMessage(body.error?.message ?? "Couldn't load jobs.");
          return;
        }

        setJobs(body.data.items);
        setTotal(body.data.total);
        setState(body.data.items.length === 0 ? "empty" : "ready");
      } catch {
        if (!cancelled) {
          setState("error");
          setErrorMessage("Couldn't reach the server — check your connection.");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filters, offset]);

  return (
    <main className="min-h-screen bg-paper">
      <header className="bg-board text-paper px-6 py-10 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col gap-2">
          <h1 className="font-display text-3xl md:text-4xl">JobNetWork</h1>
          <p className="text-paper/80 max-w-md">
            Internships and entry-level roles, updated in real time — plus a few we posted ourselves.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-12 -mt-6">
        <FilterBar value={filters} onChange={setFilters} />
      </div>

      <section className="max-w-5xl mx-auto px-6 md:px-12 py-10">
        {state === "loading" && (
          <div className="space-y-4" aria-live="polite">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="pinned-card p-5 pl-6 h-24 animate-pulse bg-ink/5" />
            ))}
          </div>
        )}

        {state === "error" && (
          <div className="pinned-card p-6 pl-7">
            <p className="font-display text-lg">Couldn't load listings</p>
            <p className="text-sm text-ink/60 mt-1">{errorMessage}</p>
          </div>
        )}

        {state === "rate_limited" && (
          <div className="pinned-card p-6 pl-7">
            <p className="font-display text-lg">One moment</p>
            <p className="text-sm text-ink/60 mt-1">{errorMessage}</p>
          </div>
        )}

        {state === "empty" && (
          <div className="pinned-card p-6 pl-7">
            <p className="font-display text-lg">No matches yet</p>
            <p className="text-sm text-ink/60 mt-1">
              Try widening a filter, or clear your search to see everything.
            </p>
          </div>
        )}

        {state === "ready" && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
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
      </section>
    </main>
  );
}
