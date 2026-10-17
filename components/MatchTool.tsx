"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ResumeMatchResult } from "@/lib/resume-match";

type JobForMatch = {
  title: string;
  description: string;
  skills: string[];
  exp_min: number | null;
  exp_max: number | null;
};

type PickedJob = JobForMatch & { id: string; company: string };

const MIN_PASTED = 40;

export default function MatchTool() {
  const searchParams = useSearchParams();

  // Arriving from a job card: the job travels in the URL as one JSON param.
  const cardJob: JobForMatch | null = useMemo(() => {
    const raw = searchParams.get("job");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [searchParams]);

  const [useCardJob, setUseCardJob] = useState(true);

  // Standalone: pick a listed job, or paste one.
  const [mode, setMode] = useState<"pick" | "paste">("pick");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [options, setOptions] = useState<PickedJob[] | null>(null);
  const [picked, setPicked] = useState<PickedJob | null>(null);
  const [pastedTitle, setPastedTitle] = useState("");
  const [pastedText, setPastedText] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<ResumeMatchResult | null>(null);

  const fromCard = Boolean(cardJob) && useCardJob;

  const job: JobForMatch | null = useMemo(() => {
    if (fromCard) return cardJob;
    if (mode === "pick") return picked;
    if (pastedText.trim().length < MIN_PASTED) return null;
    return {
      title: pastedTitle.trim() || "Pasted job",
      description: pastedText.trim(),
      skills: [],
      exp_min: null,
      exp_max: null,
    };
  }, [fromCard, cardJob, mode, picked, pastedTitle, pastedText]);

  async function findJobs(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/jobs?q=${encodeURIComponent(q)}&limit=6`);
      const body = await res.json().catch(() => null);
      if (!body?.success) {
        setSearchError(body?.error?.message ?? "Couldn't search jobs right now.");
        setOptions(null);
        return;
      }
      setOptions(
        (body.data.items as Array<Record<string, any>>).map((j) => ({
          id: String(j.id),
          title: String(j.title ?? ""),
          company: String(j.company ?? ""),
          description: String(j.description ?? ""),
          skills: Array.isArray(j.skills) ? j.skills : [],
          exp_min: typeof j.exp_min === "number" ? j.exp_min : null,
          exp_max: typeof j.exp_max === "number" ? j.exp_max : null,
        }))
      );
    } catch {
      setSearchError("Couldn't reach the server — check your connection.");
      setOptions(null);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !job) return;

    setState("loading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.set("resume", file);
      formData.set(
        "job",
        JSON.stringify({
          title: job.title,
          description: job.description,
          skills: job.skills,
          exp_min: job.exp_min,
          exp_max: job.exp_max,
        })
      );

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

  const fieldCls = "mt-1 w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm";
  const tabCls = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium ${
      on ? "border-board bg-board text-white" : "border-ink/20 bg-white text-ink"
    }`;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="resume-file" className="text-sm font-medium text-ink">
            1. Your resume
          </label>
          <input
            id="resume-file"
            type="file"
            accept="application/pdf,.pdf"
            aria-describedby="resume-hint"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm"
          />
          <p id="resume-hint" className="mt-1 text-xs text-ink/70">
            PDF only, under 5 MB. Word (.docx) files aren&apos;t supported, so export your
            resume as a PDF first.
          </p>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-ink">2. The job</legend>

          {fromCard ? (
            <div className="mt-2 rounded-lg border border-ink/15 bg-white p-3 text-sm">
              <p>
                Checking your resume against{" "}
                <span className="font-medium">{cardJob?.title}</span>
              </p>
              <button
                type="button"
                onClick={() => setUseCardJob(false)}
                className="mt-1 text-xs font-semibold text-denim hover:underline"
              >
                Use a different job
              </button>
            </div>
          ) : (
            <div className="mt-2 space-y-3">
              <div className="flex gap-2" role="group" aria-label="How to choose the job">
                <button type="button" aria-pressed={mode === "pick"} onClick={() => setMode("pick")} className={tabCls(mode === "pick")}>
                  Pick a listed job
                </button>
                <button type="button" aria-pressed={mode === "paste"} onClick={() => setMode("paste")} className={tabCls(mode === "paste")}>
                  Paste a job description
                </button>
              </div>

              {mode === "pick" ? (
                <div>
                  <label htmlFor="job-search" className="text-xs font-medium text-ink/70">
                    Search by title, company or skill
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id="job-search"
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") findJobs(e);
                      }}
                      placeholder="e.g. data analyst"
                      className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={findJobs}
                      disabled={searching || !search.trim()}
                      className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium disabled:opacity-50"
                    >
                      {searching ? "Searching…" : "Find jobs"}
                    </button>
                  </div>
                  {searchError && <p className="mt-2 text-sm text-red-600">{searchError}</p>}
                  {options && options.length === 0 && (
                    <p className="mt-2 text-sm text-ink/70">No jobs found. Try another search, or paste a description.</p>
                  )}
                  {options && options.length > 0 && (
                    <ul className="mt-2 space-y-1.5" role="radiogroup" aria-label="Matching jobs">
                      {options.map((o) => (
                        <li key={o.id}>
                          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-ink/15 bg-white p-2.5 text-sm has-[:checked]:border-board">
                            <input
                              type="radio"
                              name="picked-job"
                              checked={picked?.id === o.id}
                              onChange={() => setPicked(o)}
                              className="mt-1"
                            />
                            <span>
                              <span className="block font-medium">{o.title}</span>
                              <span className="block text-xs text-ink/70">{o.company}</span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="pasted-title" className="text-xs font-medium text-ink/70">
                      Job title (optional)
                    </label>
                    <input id="pasted-title" type="text" value={pastedTitle} onChange={(e) => setPastedTitle(e.target.value)} className={fieldCls} />
                  </div>
                  <div>
                    <label htmlFor="pasted-text" className="text-xs font-medium text-ink/70">
                      Job description
                    </label>
                    <textarea
                      id="pasted-text"
                      rows={7}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      aria-describedby="pasted-hint"
                      className={fieldCls}
                    />
                    <p id="pasted-hint" className="mt-1 text-xs text-ink/70">
                      Paste at least a few lines of the listing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </fieldset>

        <div>
          <button
            type="submit"
            disabled={!file || !job || state === "loading"}
            className="bg-denim text-paper px-5 py-2 font-medium disabled:opacity-50"
          >
            {state === "loading" ? "Checking…" : "Check my match"}
          </button>
          {(!file || !job) && (
            <p className="mt-2 text-xs text-ink/70">
              {!file ? "Add your resume PDF" : "Choose or paste a job"} to enable this button.
            </p>
          )}
        </div>
      </form>

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
    </div>
  );
}
