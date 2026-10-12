import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getJobBySlug } from "@/lib/jobs/jobs.functions";
import { formatSalary } from "@/components/jobs/JobCard";
import SaveJobButton from "@/components/jobs/SaveJobButton";

function htmlToText(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// Allow a small, safe subset of tags from the job feed; strip everything else.
function sanitizeJobHtml(html: string): string {
  let out = html;
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/\son\w+="[^"]*"/gi, "");
  out = out.replace(/\son\w+='[^']*'/gi, "");
  out = out.replace(/javascript:/gi, "");
  return out;
}

export const Route = createFileRoute("/jobs/$slug")({
  loader: async ({ params }) => {
    const job = await getJobBySlug({ data: params.slug });
    if (!job) throw notFound();
    return job;
  },
  head: ({ loaderData: job }) => ({
    meta: job
      ? [
          { title: `${job.title} at ${job.company} | JobNetWork` },
          { name: "description", content: htmlToText(job.description) },
          {
            property: "og:title",
            content: `${job.title} at ${job.company} | JobNetWork`,
          },
          { property: "og:description", content: htmlToText(job.description) },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Job not found | JobNetWork" }],
  }),
  component: JobDetailPage,
});

function JobDetailPage() {
  const job = Route.useLoaderData();
  const salary = formatSalary(job);
  const sanitizedDescription = sanitizeJobHtml(job.description);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10 md:px-12">
        <Link to="/jobs" className="text-sm text-primary hover:underline">
          ← Back to all jobs
        </Link>

        <div className="pinned-card mt-4 py-6">
          <div className="flex items-start gap-4">
            {job.logo ? (
              <img
                src={job.logo}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg border bg-card object-contain p-1"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground">
                {job.company.charAt(0)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold leading-snug">
                {job.title}
              </h1>
              <p className="text-muted-foreground">{job.company}</p>

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

              {job.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted px-2.5 py-1 text-xs text-foreground/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Apply →
            </a>
            <SaveJobButton job={job} />
          </div>

          <div
            className="prose prose-sm mt-6 max-w-none border-t pt-6 text-foreground/80"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        </div>
      </div>
    </main>
  );
}
