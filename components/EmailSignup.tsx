"use client";

import { useState } from "react";
import type { Filters } from "./FilterBar";

export default function EmailSignup({ filters }: { filters: Filters }) {
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");

    // `q` isn't a real filter Artha's API honors (confirmed separately), so
    // it's deliberately dropped here rather than saved into a standing
    // subscription. `niche_keywords` is the real, documented mechanism for
    // skill/keyword matching, built from this form's own dedicated input —
    // independent of whatever's in the page's search box right now.
    const alertFilters = {
      location: filters.location || undefined,
      job_type: filters.job_type || undefined,
      work_mode: filters.work_mode || undefined,
      exp_level: filters.exp_level || undefined,
      niche_keywords: skills.trim() || undefined,
    };

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, filters: alertFilters }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="text-sm text-board">
        Check your inbox to confirm — you'll get new matching jobs by email.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 max-w-md">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink/60">
          Skills or keywords (optional)
        </label>
        <input
          type="text"
          placeholder="e.g. React, SQL, content writing"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="bg-transparent border-b border-ink/20 px-1 py-1 text-sm focus:border-mustard outline-none"
        />
        <p className="text-xs text-ink/40">
          Leave blank to get everything matching your current filters instead.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="email"
          required
          placeholder="you@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-transparent border-b border-ink/20 px-1 py-1 text-sm focus:border-mustard outline-none"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-board text-paper text-sm px-4 py-1.5 hover:bg-boardDark disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Email me new matches"}
        </button>
      </div>

      {status === "error" && (
        <span className="text-sm text-red-700">Couldn't save that — try again.</span>
      )}
    </form>
  );
}
