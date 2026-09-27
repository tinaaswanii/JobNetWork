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
          <div className="flex items-baseline justify-between">
            <p className="font-display text-3xl text-ink">{result.score}%</p>
            <p
              className={`text-sm font-medium ${
                result.level === "strong"
                  ? "text-emerald-700"
                  : result.level === "moderate"
                  ? "text-mustard"
                  : result.level === "weak"
                  ? "text-red-600"
                  : "text-ink/50"
              }`}
            >
              {result.level === "strong"
                ? "Strong match"
                : result.level === "moderate"
                ? "Moderate match"
                : result.level === "weak"
                ? "Weak match"
                : "Limited match data"}
            </p>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className={`h-full rounded-full ${
                result.level === "strong"
                  ? "bg-emerald-600"
                  : result.level === "weak"
                  ? "bg-red-500"
                  : "bg-mustard"
              }`}
              style={{ width: `${Math.max(4, result.score)}%` }}
            />
          </div>

          {result.level === "limited" && (
            <p className="mt-3 text-sm text-ink/60">
              This listing doesn't have enough detail (no skills or experience requirement
              listed) for a real comparison — that's a gap in the job data, not your resume.
            </p>
          )}

          {(result.experienceRequired !== null || result.experienceDetected !== null) && (
            <div className="mt-4 text-sm">
              <p className="font-medium text-ink">Experience</p>
              <p className="mt-1 text-ink/70">
                {result.experienceRequired !== null
                  ? `Role asks for ${result.experienceRequired}+ years`
                  : "No specific experience requirement listed"}
                {result.experienceDetected !== null
                  ? ` — resume shows about ${result.experienceDetected} year${
                      result.experienceDetected === 1 ? "" : "s"
                    }`
                  : " — couldn't detect years of experience on your resume"}
                .
              </p>
            </div>
          )}

          {result.matchedSkills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-ink">
                You've got this covered ({result.matchedSkills.length})
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {result.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800 border border-emerald-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missingSkills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-ink">
                The gap to close ({result.missingSkills.length})
              </p>
              <p className="mt-1 text-xs text-ink/50">
                Not on your resume, or not phrased the way this listing expects — worth
                addressing directly in your application or cover letter if you have the
                experience.
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {result.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800 border border-amber-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
