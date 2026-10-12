import { Link } from "@tanstack/react-router";
import type { PublicJob } from "@/lib/jobs/types";

export function formatSalary(job: PublicJob) {
  if (!job.salary_min && !job.salary_max) return null;
  const curr = (job.salary_curr ?? "").toUpperCase();
  const isInr = curr === "INR";
  const prefix = isInr ? "₹" : curr ? `${curr} ` : "";
  // Indian digit grouping (1,00,000) for rupees, standard grouping otherwise.
  const fmt = (n: number) =>
    new Intl.NumberFormat(isInr ? "en-IN" : "en-US", {
      maximumFractionDigits: 0,
    }).format(n);
  if (job.salary_min && job.salary_max) {
    return `${prefix}${fmt(job.salary_min)} - ${prefix}${fmt(job.salary_max)}`;
  }
  return `${prefix}${fmt(job.salary_min ?? job.salary_max!)}+`;
}

export function ageInDays(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export function timeAgo(dateStr: string) {
  const days = ageInDays(dateStr);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}

export default function JobCard({ job }: { job: PublicJob }) {
  const salary = formatSalary(job);
  const isNew = ageInDays(job.posted_date) <= 2;
  const visibleSkills = (job.skills ?? []).slice(0, 4);
  const extraSkillCount = (job.skills ?? []).length - visibleSkills.length;

  return (
    <div className="pinned-card flex h-full flex-col py-5">
      <Link
        to="/jobs/$slug"
        params={{ slug: job.slug }}
        className="flex items-start gap-4"
      >
        {job.logo ? (
          <img
            src={job.logo}
            alt=""
            className="h-11 w-11 shrink-0 rounded-lg border bg-card object-contain p-1"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-semibold text-primary-foreground">
            {job.company.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold leading-snug">
              {job.title}
            </h3>
            {isNew && (
              <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                New
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{job.company}</p>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {job.location && <span>{job.location}</span>}
            {job.job_type && (
              <span className="capitalize">
                {job.job_type.replace("-", " ")}
              </span>
            )}
            {salary && (
              <span className="font-medium text-primary">{salary}</span>
            )}
          </div>

          {visibleSkills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground/80"
                >
                  {skill}
                </span>
              ))}
              {extraSkillCount > 0 && (
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  +{extraSkillCount}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
        <p className="text-xs text-muted-foreground">
          {timeAgo(job.posted_date)}
        </p>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Apply ↗
        </a>
      </div>
    </div>
  );
}
