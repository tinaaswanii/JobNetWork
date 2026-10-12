import { useEffect, useState } from "react";
import type { ArthaFilters } from "@/lib/jobs/types";
import { getJobFilters } from "@/lib/jobs/jobs.functions";

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
  // Only pushed up to onChange after the user pauses typing for a bit.
  const [qDraft, setQDraft] = useState(value.q);

  // Keep the draft in sync if the parent resets filters.
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
    getJobFilters()
      .then(setOptions)
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
      {/* Hero search — the primary way into the site. */}
      <div className="pinned-card flex items-center gap-3 px-5 py-4 md:px-6 md:py-5">
        <svg
          className="h-6 w-6 shrink-0 text-foreground/40"
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
          className="w-full bg-transparent text-xl outline-none placeholder:text-foreground/35 md:text-2xl"
        />
        {qDraft && (
          <button
            type="button"
            onClick={() => setQDraft("")}
            aria-label="Clear search"
            className="shrink-0 px-1 text-xl leading-none text-foreground/40 hover:text-foreground"
          >
            ×
          </button>
        )}
      </div>

      {/* Secondary filters — smaller, quieter, below the hero search */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="mr-1 text-xs uppercase tracking-wide text-foreground/40">
          Refine{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}:
        </span>
        <FilterSelect
          label="Type"
          value={value.job_type}
          onChange={(v) => set({ job_type: v })}
          options={options?.job_types}
        />
        <FilterSelect
          label="Work mode"
          value={value.work_mode}
          onChange={(v) => set({ work_mode: v })}
          options={options?.work_modes}
        />
        <FilterSelect
          label="Experience"
          value={value.exp_level}
          onChange={(v) => set({ exp_level: v })}
          options={options?.experience_levels}
        />
        <select
          value={value.sort_by}
          onChange={(e) => set({ sort_by: e.target.value })}
          className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground/80"
        >
          <option value="newest">Newest first</option>
          <option value="most_relevant">Most relevant</option>
          <option value="high_cpa">High priority</option>
        </select>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; count: number }[] | undefined;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground/80"
    >
      <option value="">{label}: any</option>
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.value}
        </option>
      ))}
    </select>
  );
}
