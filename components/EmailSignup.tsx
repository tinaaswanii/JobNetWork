"use client";

import { useState } from "react";
import type { Filters } from "./FilterBar";

export default function EmailSignup({ filters }: { filters: Filters }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, filters }),
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
    <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
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
      {status === "error" && (
        <span className="text-sm text-red-700">Couldn't save that — try again.</span>
      )}
    </form>
  );
}
