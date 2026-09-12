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

  return (
    <div className="pinned-card p-5 pl-6 flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search job titles, skills, companies..."
        value={value.q}
        onChange={(e) => set({ q: e.target.value })}
        className="w-full bg-transparent border-b border-ink/20 pb-2 font-body text-ink placeholder:text-ink/40 focus:border-mustard outline-none"
      />

      <div className="flex flex-wrap gap-3">
        <Select
          label="Country"
          value={value.location}
          onChange={(v) => set({ location: v })}
          options={options?.countries}
        />
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
          className="bg-paper border border-ink/20 px-3 py-1.5 text-sm text-ink"
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
      className="bg-paper border border-ink/20 px-3 py-1.5 text-sm text-ink"
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
