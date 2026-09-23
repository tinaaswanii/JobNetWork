"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ResumeMatchResult } from "@/lib/resume-match";
type JobForMatch = {
  title: string;
  description: string;
  skills: string[];
  exp_min: number | null;
  exp_max: number | null;
  url: string;
};

export default function MatchPage() {
  return (
    <Suspense fallback={null}>
      <MatchPageContent />
    </Suspense>
  );
}

function MatchPageContent() {
  const searchParams = useSearchParams();

  const job: JobForMatch | null = useMemo(() => {
    const raw = searchParams.get("job");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [searchParams]);

  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<ResumeMatchResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !job) return;

    setState("loading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.set("resume", file);
      formData.set("job", JSON.stringify(job));

      const res = await fetch("/api/match", { method: "POST", body: formData });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setState("error");
        setErrorMessage(body.error ?? "Couldn't match your resume.");
        return;
      }

      setResult(body.data);
      setState("done");
    } catch {
      setState("error");
      setErrorMessage("Couldn't reach the server — check your connection.");
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Match my resume</h1>

      {job ? (
        <p className="mt-2 text-sm text-ink/70">
          Checking your resume against <span className="font-medium">{job.title}</span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-ink/70">
          Open this page from a job listing to match against that specific role, or upload a
          resume below to see a general skills read.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink">Resume (PDF, under 5 MB)</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm"
          />
        </label>

        <button
          type="submit"
          disabled={!file || !job || state === "loading"}
          className="bg-denim text-paper px-5 py-2 font-medium disabled:opacity-50"
        >
          {state === "loading" ? "Checking…" : "Check my match"}
        </button>
      </form>

      {!job && (
        <p className="mt-4 text-sm text-ink/50">
          No job selected, so the button above stays disabled until you arrive here via a
          job's "Match my resume" link.
        </p>
      )}

      {state === "error" && <p className="mt-4 text-sm text-red-600">{errorMessage}</p>}

    {state === "done" && result && (
  <div className="mt-6 pinned-card p-5">
    <p className="font-display text-3xl text-ink">
      {result.level === "strong"
        ? "Strong Match"
        : result.level === "moderate"
        ? "Moderate Match"
        : result.level === "weak"
        ? "Weak Match"
        : "Limited Match Data"}
    </p>

    <p className="text-sm text-ink/60">match result</p>

    {result.matchedSkills.length > 0 && (
      <div className="mt-4">
        <p className="text-sm font-medium text-ink">Matched skills</p>
        <p className="text-sm text-ink/70">
          {result.matchedSkills.join(", ")}
        </p>
      </div>
    )}

    {result.missingSkills.length > 0 && (
      <div className="mt-3">
        <p className="text-sm font-medium text-ink">Missing skills</p>
        <p className="text-sm text-ink/70">
          {result.missingSkills.join(", ")}
        </p>
      </div>
    )}

    {job.url && (
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block bg-mustard text-ink px-5 py-2 font-medium"
      >
        Apply for this job
      </a>
    )}
  </div>
)}
            </div>
          )}

          {result.missingSkills.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-ink">Missing skills</p>
              <p className="text-sm text-ink/70">{result.missingSkills.join(", ")}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
