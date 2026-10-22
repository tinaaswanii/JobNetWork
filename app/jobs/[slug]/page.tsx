import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { buildJobPostingJsonLd } from "@/lib/job-posting";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobBySlug as getJob } from "@/lib/job-lookup";
import { isArthaUrlExpired } from "@/lib/artha-url";
import { htmlToText, sanitizeJobHtml } from "@/lib/html";
import type { PublicJob } from "@/lib/types";
import JobActions from "@/components/jobs/JobActions";

// Short window so a refreshed (non-expired) Apply link replaces a "refreshing" notice quickly.
// Raise it only if Artha's signed links are known to outlive it.
export const revalidate = 600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const job = await getJob(params.slug);
  if (!job) return { title: "Job not found" };

  const title = `${job.title} at ${job.company}`;
  const plainDescription = htmlToText(job.description, 160);

  return pageMetadata({
    title,
    description: plainDescription || `${job.title} at ${job.company}, listed on JobNetWork.`,
    path: `/jobs/${job.slug}`,
  });
}

function formatSalary(job: PublicJob) {
  if (!job.salary_min && !job.salary_max) return null;
  const curr = (job.salary_curr ?? "").toUpperCase();
  const isInr = curr === "INR";
  const prefix = isInr ? "₹" : curr ? `${curr} ` : "";
  const fmt = (n: number) =>
    new Intl.NumberFormat(isInr ? "en-IN" : "en-US", { maximumFractionDigits: 0 }).format(n);
  if (job.salary_min && job.salary_max) {
    return `${prefix}${fmt(job.salary_min)} – ${prefix}${fmt(job.salary_max)}`;
  }
  return `${prefix}${fmt(job.salary_min ?? job.salary_max!)}+`;
}

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  const job = await getJob(params.slug);
  if (!job) notFound();

  const salary = formatSalary(job);
  const sanitizedDescription = sanitizeJobHtml(job.description);
  // True only when a live refresh also failed: never render a dead Apply link.
  const applyExpired = isArthaUrlExpired(job.url);

  const matchHref = `/match?job=${encodeURIComponent(
    JSON.stringify({
      title: job.title,
      description: job.description,
      skills: job.skills,
      exp_min: job.exp_min,
      exp_max: job.exp_max,
    })
  )}`;

  // JobPosting markup only when the data has every required field (see lib/job-posting.ts).
  const jsonLd = buildJobPostingJsonLd(job);

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-paper">
      {/* eslint-disable-next-line react/no-danger */}
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-10">
        <Link href="/jobs" className="inline-flex min-h-[44px] items-center text-sm text-denim hover:underline">
          ← Back to all jobs
        </Link>

        <div className="mt-4 pinned-card py-6">
          <div className="flex items-start gap-4">
            {job.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={job.logo} alt="" className="h-12 w-12 shrink-0 rounded-lg border bg-white object-contain p-1" />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded-lg bg-board text-white flex items-center justify-center text-lg font-semibold">
                {job.company.charAt(0)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl leading-snug text-ink">{job.title}</h1>
              <p className="text-muted-foreground">{job.company}</p>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {job.location && <span>{job.location}</span>}
                {job.job_type && <span className="capitalize">{job.job_type.replace("-", " ")}</span>}
                {salary && <span className="text-denim font-medium">{salary}</span>}
              </div>

              {job.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <span key={skill} className="rounded-md bg-muted px-2.5 py-1 text-xs text-ink/80">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {applyExpired ? (
              <p role="status" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-ink">
                The apply link for this job is being refreshed. Please check back in a few minutes.
              </p>
            ) : (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-board px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0b3a28]"
              >
                Apply →
              </a>
            )}
            <Link
              href={matchHref}
              className="inline-block rounded-lg border px-4 py-2 text-sm font-medium text-ink transition hover:bg-muted"
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

          <div
            className="mt-6 prose prose-sm max-w-none text-ink/80 border-t pt-6"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        </div>
      </div>
    </main>
  );
}
