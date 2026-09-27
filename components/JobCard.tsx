import Link from "next/link";
import type { PublicJob } from "@/lib/types";

// The client/brand handle this account publishes under on artha.link —
// consistent across every job we've seen from the API (clientName=getyourjob
// in every r.artha.link redirect URL). Only matters for the canonical-URL
// rebuild below; if the Artha account's handle ever changes, update this.
const ARTHA_CLIENT_HANDLE = "getyourjob";

// Artha's public API's own `url` field is sometimes a *signed, time-limited*
// redirect (r.artha.link/redirect/...?expires=...&signature=...) and
// sometimes a stable direct link straight to the employer's own careers
// page. Only the signed ones expire (we've confirmed real ones expiring
// ~8 days after being issued) — direct employer links don't need touching.
const SIGNED_REDIRECT_PATTERN = /^https:\/\/r\.artha\.link\/redirect\//;

function getApplyHref(job: PublicJob): string {
  if (SIGNED_REDIRECT_PATTERN.test(job.url) && job.slug) {
    // The canonical, non-expiring artha.link job page — lets the user read
    // the full listing there first instead of landing straight on a raw
    // signed redirect that may already be dead by the time they click it.
    return `https://artha.link/@${ARTHA_CLIENT_HANDLE}/jobs/${job.slug}`;
  }
  return job.url;
}

function formatSalary(job: PublicJob) {
  if (!job.salary_min && !job.salary_max) return null;
  const curr = job.salary_curr ?? "USD";
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
  if (job.salary_min && job.salary_max) {
    return `${curr} ${fmt(job.salary_min)}-${fmt(job.salary_max)}`;
  }
  return `${curr} ${fmt(job.salary_min ?? job.salary_max!)}+`;
}

function timeAgo(dateStr: string) {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86400000
  );
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}

export default function JobCard({ job }: { job: PublicJob }) {
  const salary = formatSalary(job);
  const applyHref = getApplyHref(job);
  const visibleSkills = (job.skills ?? []).slice(0, 4);
  const extraSkillCount = (job.skills ?? []).length - visibleSkills.length;

  // NOTE: this must stay a single JSON "job" param — app/match/page.tsx
  // reads searchParams.get("job") and JSON.parses it. Sending separate
  // title/company/skills params here (as a previous edit did) breaks the
  // match page silently, since it will never find a "job" key.
  const matchHref = `/match?job=${encodeURIComponent(
    JSON.stringify({
      title: job.title,
      description: job.description,
      skills: job.skills,
      exp_min: job.exp_min,
      exp_max: job.exp_max,
    })
  )}`;

  return (
    <div className="pinned-card p-5 pl-6 hover:border-mustard transition-colors">
      <a
        href={applyHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-4"
      >
        {job.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.logo}
            alt=""
            className="h-10 w-10 object-contain shrink-0"
          />
        ) : (
          <div className="h-10 w-10 shrink-0 bg-board text-paper flex items-center justify-center font-display text-lg">
            {job.company.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-snug text-ink truncate">
            {job.title}
          </h3>

          <p className="text-sm text-ink/70">{job.company}</p>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink/60">
            {job.location && <span>{job.location}</span>}
            {job.job_type && (
              <span className="capitalize">
                {job.job_type.replace("-", " ")}
              </span>
            )}
            {salary && (
              <span className="text-denim font-medium">{salary}</span>
            )}
          </div>

          {visibleSkills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-board/10 px-2 py-0.5 text-xs text-ink/70"
                >
                  {skill}
                </span>
              ))}
              {extraSkillCount > 0 && (
                <span className="rounded-full bg-board/10 px-2 py-0.5 text-xs text-ink/50">
                  +{extraSkillCount} more
                </span>
              )}
            </div>
          )}

          <p className="mt-2 text-xs text-ink/50">
            {timeAgo(job.posted_date)}
          </p>
        </div>
      </a>

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-denim px-3 py-2 text-sm font-medium text-paper hover:opacity-90"
        >
          Apply →
        </a>
        <Link
          href={matchHref}
          className="inline-block rounded-lg bg-mustard px-3 py-2 text-sm font-medium text-ink hover:opacity-90"
        >
          Match My Resume
        </Link>
      </div>
    </div>
  );
}
