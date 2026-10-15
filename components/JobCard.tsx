import Link from "next/link";
import type { PublicJob } from "@/lib/types";
import JobActions from "@/components/jobs/JobActions";
import { isArthaUrlExpired } from "@/lib/artha-url";

function formatSalary(job: PublicJob) {
  if (!job.salary_min && !job.salary_max) return null;
  const curr = (job.salary_curr ?? "").toUpperCase();
  const isInr = curr === "INR";
  const prefix = isInr ? "₹" : curr ? `${curr} ` : "";
  const fmt = (n: number) =>
    new Intl.NumberFormat(isInr ? "en-IN" : "en-US", { maximumFractionDigits: 0 }).format(n);
  if (job.salary_min && job.salary_max) return `${prefix}${fmt(job.salary_min)} - ${prefix}${fmt(job.salary_max)}`;
  return `${prefix}${fmt(job.salary_min ?? job.salary_max!)}+`;
}

// Only what the data actually says: no guessing units or levels.
function formatExperience(job: PublicJob) {
  const { exp_min: min, exp_max: max } = job;
  if (min == null && max == null) return null;
  const unit = (job.exp_unit ?? "yrs").toLowerCase();
  if (min != null && max != null && min !== max) return `${min}–${max} ${unit}`;
  return `${min ?? max}${min != null && max == null ? "+" : ""} ${unit}`;
}

function ageInDays(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function timeAgo(dateStr: string) {
  const days = ageInDays(dateStr);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}

export default function JobCard({ job }: { job: PublicJob }) {
  const salary = formatSalary(job);
  const experience = formatExperience(job);
  const isOwn = job.id.startsWith("own_");
  const applyExpired = isArthaUrlExpired(job.url);
  const isNew = ageInDays(job.posted_date) <= 2;
  const visibleSkills = (job.skills ?? []).slice(0, 4);
  const extraSkillCount = (job.skills ?? []).length - visibleSkills.length;

  // NOTE: must stay a single JSON "job" param — app/match/page.tsx reads
  // searchParams.get("job") and JSON.parses it.
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
    <article className="pinned-card flex flex-col py-5">
      <Link
        href={`/jobs/${job.slug}`}
        className="group flex flex-1 items-start gap-4 rounded-lg"
      >
        {job.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={job.logo} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-xl border bg-white object-contain p-1" />
        ) : (
          <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-board text-lg font-semibold text-white">
            {job.company.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                isOwn ? "bg-board text-white" : "bg-muted text-ink/70"
              }`}
            >
              {isOwn ? "JobNetWork" : "External"}
            </span>
            {isNew && (
              <span className="rounded-md bg-mustard px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
                New
              </span>
            )}
          </div>

          <h3 className="mt-1.5 text-base font-semibold leading-snug text-ink group-hover:text-board md:text-lg">
            {job.title}
          </h3>
          <p className="text-sm font-medium text-ink/70">{job.company}</p>

          <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {job.location && <li>{job.location}</li>}
            {job.job_type && <li className="capitalize">{job.job_type.replace(/[-_]/g, " ")}</li>}
            {experience && <li>{experience}</li>}
            {salary && <li className="font-medium text-denim">{salary}</li>}
          </ul>

          {visibleSkills.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {visibleSkills.map((skill) => (
                <li key={skill} className="rounded-md bg-muted px-2 py-0.5 text-xs text-ink/80">
                  {skill}
                </li>
              ))}
              {extraSkillCount > 0 && (
                <li className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">+{extraSkillCount} more</li>
              )}
            </ul>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            <time dateTime={job.posted_date}>{timeAgo(job.posted_date)}</time>
          </p>
        </div>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-4">
        {applyExpired ? (
          <Link
            href={`/jobs/${job.slug}`}
            className="inline-flex min-h-[40px] items-center rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b3a28]"
          >
            View job →
          </Link>
        ) : (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Apply to ${job.title} at ${job.company} (opens in a new tab)`}
            className="inline-flex min-h-[40px] items-center rounded-lg bg-board px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b3a28]"
          >
            Apply →
          </a>
        )}
        <Link
          href={matchHref}
          className="inline-flex min-h-[40px] items-center rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink transition hover:bg-muted"
        >
          Match my resume
        </Link>
        <JobActions
          job={{
            job_id: job.slug,
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.url,
            job_type: job.job_type,
          }}
        />
      </div>
    </article>
  );
}
