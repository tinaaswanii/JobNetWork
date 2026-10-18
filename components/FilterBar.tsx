"use client";

import { useEffect, useRef, useState } from "react";
import type { ArthaFilters } from "@/lib/types";

import { emptyFilters, POSTED_OPTIONS, type Filters } from "@/lib/jobs-query";
import { ROLE_PRESETS, isRoleKey } from "@/lib/role-presets";

export { emptyFilters };
export type { Filters };

const SORT_LABELS: Record<string, string> = {
  newest: "Newest first",
  most_relevant: "Most relevant",
  high_cpa: "Featured",
};

const FEATURED_TIP = "Featured: listings from our job partners are shown first.";

const selectCls =
  "min-h-[36px] rounded-lg border border-ink/15 bg-white px-2.5 py-1 text-sm text-ink/90 transition hover:border-ink/30";

export default function FilterBar({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
}) {
  const [options, setOptions] = useState<ArthaFilters | null>(null);

  // Typed text is held locally and committed after a pause (or on Enter),
  // so every keystroke doesn't fire a request.
  const [qDraft, setQDraft] = useState(value.q);
  const [locDraft, setLocDraft] = useState(value.location);

  // Always merge into the LATEST committed filters, never a stale closure.
  const latest = useRef(value);
  latest.current = value;
  const commit = (patch: Partial<Filters>) => onChange({ ...latest.current, ...patch });

  // Parent resets (Clear all, chip removal) flow back into the drafts.
  useEffect(() => setQDraft(value.q), [value.q]);
  useEffect(() => setLocDraft(value.location), [value.location]);

  useEffect(() => {
    if (qDraft.trim() === value.q) return;
    const t = setTimeout(() => commit({ q: qDraft.trim() }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDraft]);

  useEffect(() => {
    if (locDraft.trim() === value.location) return;
    const t = setTimeout(() => commit({ location: locDraft.trim() }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locDraft]);

  // "Most relevant" needs search text; fall back to newest if it disappears.
  useEffect(() => {
    if (value.sort_by === "most_relevant" && !value.q.trim()) commit({ sort_by: "newest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.q, value.sort_by]);

  useEffect(() => {
    fetch("/api/jobs/filters")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setOptions(res.data);
      })
      .catch(() => {
        /* dropdown options are optional; free-text search still works */
      });
  }, []);

  // The API's own work-mode wording if we have it; "Remote" until options load.
  const remoteValue = options?.work_modes.find((o) => /remote/i.test(o.value))?.value ?? "Remote";
  const remoteOn = /remote/i.test(value.work_mode);
  const cities = (options?.cities ?? []).slice(0, 200);
  const hasSearch = qDraft.trim() !== "" || value.q.trim() !== "";

  const chips: { key: keyof Filters; label: string }[] = [];
  if (value.q) chips.push({ key: "q", label: `“${value.q}”` });
  if (value.location) chips.push({ key: "location", label: `Location: ${value.location}` });
  if (value.job_type) chips.push({ key: "job_type", label: `Type: ${value.job_type}` });
  if (value.work_mode) chips.push({ key: "work_mode", label: `Mode: ${value.work_mode}` });
  if (value.exp_level) chips.push({ key: "exp_level", label: `Experience: ${value.exp_level}` });
  if (value.posted) {
    const p = POSTED_OPTIONS.find((o) => o.value === value.posted);
    if (p) chips.push({ key: "posted", label: `Posted: ${p.label}` });
  }
  if (isRoleKey(value.role)) chips.push({ key: "role", label: `Role: ${ROLE_PRESETS[value.role].label}` });
  if (value.sort_by !== emptyFilters.sort_by)
    chips.push({ key: "sort_by", label: `Sort: ${SORT_LABELS[value.sort_by] ?? value.sort_by}` });

  return (
    <div className="flex flex-col gap-3">
      <div role="search" className="pinned-card flex items-center gap-3 px-5 py-4 md:px-6 md:py-5 focus-within:border-board">
        <svg className="h-6 w-6 shrink-0 text-ink/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          aria-label="Search jobs by title, company or skill"
          placeholder="Search job titles, companies, or skills..."
          value={qDraft}
          onChange={(e) => setQDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit({ q: qDraft.trim() });
          }}
          className="w-full bg-transparent font-display text-lg text-ink outline-none placeholder:text-ink/40 md:text-2xl [&::-webkit-search-cancel-button]:hidden"
        />
        {qDraft && (
          <button
            type="button"
            onClick={() => {
              setQDraft("");
              commit({ q: "" });
            }}
            aria-label="Clear search"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl leading-none text-ink/50 transition hover:bg-muted hover:text-ink"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-1">
        <input
          type="text"
          aria-label="Filter by location"
          placeholder="City or location"
          list="city-suggestions"
          autoComplete="off"
          value={locDraft}
          onChange={(e) => setLocDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit({ location: locDraft.trim() });
          }}
          className={`${selectCls} w-40 placeholder:text-ink/40`}
        />
        <datalist id="city-suggestions">
          {cities.map((c) => (
            <option key={c.value} value={c.value} />
          ))}
        </datalist>
        <button
          type="button"
          aria-pressed={remoteOn}
          onClick={() => commit({ work_mode: remoteOn ? "" : remoteValue })}
          className={`${selectCls} font-medium ${remoteOn ? "border-board bg-board text-white hover:border-board" : ""}`}
        >
          Remote
        </button>
        <Select label="Type" value={value.job_type} onChange={(v) => commit({ job_type: v })} options={options?.job_types} />
        <Select label="Work mode" value={value.work_mode} onChange={(v) => commit({ work_mode: v })} options={options?.work_modes} />
        <Select label="Experience" value={value.exp_level} onChange={(v) => commit({ exp_level: v })} options={options?.experience_levels} />
        <select
          aria-label="Posted"
          value={value.posted}
          onChange={(e) => commit({ posted: e.target.value })}
          className={selectCls}
        >
          <option value="">Posted: any time</option>
          {POSTED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort jobs"
          aria-describedby="sort-hint"
          title={value.sort_by === "high_cpa" ? FEATURED_TIP : undefined}
          value={value.sort_by}
          onChange={(e) => commit({ sort_by: e.target.value })}
          className={selectCls}
        >
          {Object.entries(SORT_LABELS).map(([v, l]) => (
            <option
              key={v}
              value={v}
              disabled={v === "most_relevant" && !hasSearch}
              title={v === "high_cpa" ? FEATURED_TIP : v === "most_relevant" && !hasSearch ? "Type a search first" : undefined}
            >
              {l}
              {v === "most_relevant" && !hasSearch ? " (search first)" : ""}
            </option>
          ))}
        </select>
        <span id="sort-hint" className="sr-only">
          {FEATURED_TIP} Most relevant is available once you type a search.
        </span>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1" aria-label="Active filters">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => commit({ [c.key]: emptyFilters[c.key] } as Partial<Filters>)}
              aria-label={`Remove filter ${c.label}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-denim/40 bg-board/15 px-3 py-1 text-xs font-medium text-denim transition hover:bg-board/25"
            >
              {c.label}
              <span aria-hidden="true">×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange({ ...emptyFilters })}
            className="px-1 text-xs font-semibold text-denim underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
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
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
      <option value="">{label}: any</option>
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.value}
        </option>
      ))}
    </select>
  );
}
