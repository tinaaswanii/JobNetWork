import Link from "next/link";
import type { PublicJob } from "@/lib/types";

function formatSalary(job: PublicJob) {
  if (!job.salary_min && !job.salary_max) return null;

  const curr = job.salary_curr ?? "USD";
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

  if (job.salary_min && job.salary_max) {
    return `${curr} ${fmt(job.salary_min)}-${fmt(job.salary_max)}`;
  }

  return `${curr} ${fmt(job.salary_min ?? job.salary_max!) }+`;
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

  const matchHref = `/match?job=${encodeURIComponent(
    JSON.stringify({
      title: job.title,
      description: job.description,
      skills: job.skills,
      exp_min: job.exp_min,
      exp_max: job.exp_max,
      url: job.url,
    })
  )}`;

  return (
    <div className="pinned-card min-w-0 max-w-full overflow-hidden p-5 pl-6 transition-colors hover:border-mustard">
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 items-start gap-4"
      >
        {job.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.logo}
            alt=""
            className="h-10 w-10 shrink-0 object-contain"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-board font-display text-lg text-paper">
            {job.company.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="break-words font-display text-lg leading-snug text-ink">
            {job.title}
          </h3>

          <p className="break-words text-sm text-ink/70">
            {job.company}
          </p>

          <div className="mt-2 flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-sm text-ink/60">
            {job.location && (
              <span className="min-w-0 break-words">{job.location}</span>
            )}

            {job.job_type && (
              <span className="capitalize break-words">
                {job.job_type.replace("-", " ")}
              </span>
            )}

            {salary && (
              <span className="break-words font-medium text-denim">
                {salary}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-ink/50">
            {timeAgo(job.posted_date)}
          </p>
        </div>
      </a>

      <div className="mt-3 flex min-w-0 flex-wrap gap-2">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block max-w-full rounded-lg bg-denim px-3 py-2 text-sm font-medium text-paper hover:opacity-90"
        >
          Apply
        </a>

        <Link
          href={matchHref}
          className="inline-block max-w-full rounded-lg bg-mustard px-3 py-2 text-sm font-medium text-ink hover:opacity-90"
        >
          Match My Resume
        </Link>
      </div>
    </div>
  );
}
