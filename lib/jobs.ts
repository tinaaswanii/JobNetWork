"use client";

import { useEffect, useState } from "react";
import type { ArthaFilters } from "@/lib/types";

export interface Filters {
  q: string;
  location: string;
  job_type: string;
  work_mode: string;
  exp_level: string;
  sort_by: string;
}

export const emptyFilters: Filters = {
  q: "",
  location: "",
  job_type: "",
  work_mode: "",
  exp_level: "",
  sort_by: "newest",
};

export default function FilterBar({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
}) {
  const [options, setOptions] = useState<ArthaFilters | null>(null);

  // Local, uncommitted text so every keystroke doesn't trigger a fetch.
  // Only pushed up to onChange (and from there to the API call) after
  // the user pauses typing for a bit.
  const [qDraft, setQDraft] = useState(value.q);

  // Keep the draft in sync if the parent resets filters (e.g. "Clear filters").
  useEffect(() => {
    setQDraft(value.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.q]);

  useEffect(() => {
    if (qDraft === value.q) return;
    const timeout = setTimeout(() => {
      set({ q: qDraft });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDraft]);

  useEffect(() => {
    fetch("/api/jobs/filters")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setOptions(res.data);
      })
      .catch(() => {
        /* filter dropdowns are a nice-to-have; fail quietly and keep free-text search */
      });
  }, []);

  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  const activeFilterCount = [
    value.job_type,
    value.work_mode,
    value.exp_level,
    value.sort_by !== "newest" ? value.sort_by : "",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Hero search — the primary way into the site. Large, high-contrast,
          front and center right under the header. Everything else here is
          secondary and visually smaller/quieter by comparison. */}
      <div className="pinned-card flex items-center gap-3 px-5 py-4 md:px-6 md:py-5">
        <svg
          className="h-6 w-6 shrink-0 text-ink/40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search job titles, companies, or skills..."
          value={qDraft}
          onChange={(e) => setQDraft(e.target.value)}
          className="w-full bg-transparent font-display text-xl md:text-2xl text-ink placeholder:text-ink/35 outline-none"
        />
        {qDraft && (
          <button
            type="button"
            onClick={() => setQDraft("")}
            aria-label="Clear search"
            className="shrink-0 text-ink/40 hover:text-ink text-xl leading-none px-1"
          >
            ×
          </button>
        )}
      </div>

      {/* Secondary filters — smaller, quieter, below the hero search */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-xs uppercase tracking-wide text-ink/40 mr-1">
          Refine{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}:
        </span>
        <Select
          label="Type"
          value={value.job_type}
          onChange={(v) => set({ job_type: v })}
          options={options?.job_types}
        />
        <Select
          label="Work mode"
          value={value.work_mode}
          onChange={(v) => set({ work_mode: v })}
          options={options?.work_modes}
        />
        <Select
          label="Experience"
          value={value.exp_level}
          onChange={(v) => set({ exp_level: v })}
          options={options?.experience_levels}
        />
        <select
          value={value.sort_by}
          onChange={(e) => set({ sort_by: e.target.value })}
          className="bg-paper border border-ink/15 px-2.5 py-1 text-xs text-ink/80 rounded"
        >
          <option value="newest">Newest first</option>
          <option value="most_relevant">Most relevant</option>
          <option value="high_cpa">High priority</option>
        </select>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: { value: string; count: number }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-paper border border-ink/15 px-2.5 py-1 text-xs text-ink/80 rounded"
    >
      <option value="">{label}: any</option>
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.value} ({opt.count})
        </option>
      ))}
    </select>
  );
}
