"use client";

import { useState } from "react";
import type { Filters } from "./FilterBar";

export default function EmailSignup({ filters }: { filters: Filters }) {
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [emailSent, setEmailSent] = useState(true);

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
      const body = await res.json().catch(() => ({}));
      setEmailSent(body.emailSent !== false);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="text-sm text-denim">
        {emailSent
          ? "You're subscribed. Check your inbox — and your spam or promotions folder — for a welcome email. If it's in spam, mark it Not spam so future job alerts reach you."
          : "You're subscribed — new matching jobs will arrive by email. (Our welcome email is delayed; we'll retry shortly.)"}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 max-w-md">
      <div className="flex flex-col gap-1">
        <label htmlFor="alert-skills" className="text-xs font-medium text-ink/60">
          Skills or keywords (optional)
        </label>
        <input
          id="alert-skills"
          type="text"
          placeholder="e.g. React, SQL, content writing"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="bg-transparent border-b border-ink/20 px-1 py-1 text-sm focus:border-mustard outline-none"
        />
        <p className="text-xs text-ink/60">
          Leave blank to get everything matching your current filters instead.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="alert-email" className="text-xs font-medium text-ink/60">
          Email address
        </label>
        <input
          id="alert-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-transparent border-b border-ink/20 px-1 py-1 text-sm focus:border-mustard outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={status === "saving"}
          className="self-start bg-board text-paper text-sm px-4 py-1.5 hover:bg-boardDark disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Email me new matches"}
        </button>
        {/* TODO(owner): say how often alerts are sent once that is decided. Not stated here on purpose. */}
        <p className="text-xs text-ink/60">
          By subscribing, you agree to receive job alert emails from JobNetWork.
          Unsubscribe anytime.
        </p>
      </div>

      {status === "error" && (
        <span className="text-sm text-red-700">Couldn't save that — try again.</span>
      )}
    </form>
  );
}
