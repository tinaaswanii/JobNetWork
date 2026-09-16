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

// Default fallback options if the backend route fails to respond
const FALLBACK_OPTIONS = {
  job_types: [
    { value: "full_time", label: "Full-Time" },
    { value: "part_time", label: "Part-Time" },
    { value: "contract", label: "Contract" },
    { value: "temporary", label: "Temporary" },
    { value: "internship", label: "Internship" },
  ],
  work_modes: [
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
    { value: "onsite", label: "Onsite" },
  ],
  experience_levels: [
    { value: "entry_level", label: "Entry Level" },
    { value: "junior", label: "Junior" },
    { value: "mid_level", label: "Mid Level" },
    { value: "senior", label: "Senior" },
    { value: "lead", label: "Lead" },
  ],
};

export default function FilterBar({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
}) {
  const [options, setOptions] = useState<ArthaFilters | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/jobs/filters")
      .then((r) => r.json())
      .then((res) => {
        if (isMounted && res.success) setOptions(res.data);
      })
      .catch(() => {
        /* Fail silently; falls back to static options */
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  return (
    <div className="pinned-card p-5 pl-6 flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search job titles, skills, companies..."
        value={value.q || ""}
        onChange={(e) => set({ q: e.target.value })}
        className="w-full bg-transparent border-b border-ink/20 pb-2 font-body text-ink placeholder:text-ink/40 focus:border-mustard outline-none"
      />

      <div className="flex flex-wrap gap-3">
        <Select
          label="Type"
          value={value.job_type}
          onChange={(v) => set({ job_type: v })}
          options={options?.job_types}
          fallback={FALLBACK_OPTIONS.job_types}
        />
        <Select
          label="Work mode"
          value={value.work_mode}
          onChange={(v) => set({ work_mode: v })}
          options={options?.work_modes}
          fallback={FALLBACK_OPTIONS.work_modes}
        />
        <Select
          label="Experience"
          value={value.exp_level}
          onChange={(v) => set({ exp_level: v })}
          options={options?.experience_levels}
          fallback={FALLBACK_OPTIONS.experience_levels}
        />
        <select
          value={value.sort_by}
          onChange={(e) => set({ sort_by: e.target.value })}
          className="bg-paper border border-ink/20 px-3 py-1.5 text-sm text-ink outline-none"
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
  fallback,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: { value: string; count?: number; label?: string }[];
  fallback: { value: string; label: string }[];
}) {
  const items = options && options.length > 0 ? options : fallback;

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="bg-paper border border-ink/20 px-3 py-1.5 text-sm text-ink outline-none cursor-pointer"
    >
      <option value="">{label}: any</option>
      {items.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label || opt.value} {opt.count !== undefined ? `(${opt.count})` : ""}
        </option>
      ))}
    </select>
  );
}
