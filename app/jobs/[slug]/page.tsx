import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { getArthaJobBySlug } from "@/lib/job-cache";
import { htmlToText, sanitizeJobHtml } from "@/lib/html";
import type { PublicJob } from "@/lib/types";

export const revalidate = 3600;

const SITE_URL = "https://job-net-work.vercel.app";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMPLOYMENT_TYPE_SCHEMA: Record<string, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
  temporary: "TEMPORARY",
  freelance: "CONTRACTOR",
};

async function getOwnJobBySlug(slug: string): Promise<PublicJob | null> {
  if (!UUID_RE.test(slug)) return null;
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("own_jobs")
    .select("*")
    .eq("id", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: `own_${data.id}`,
    slug: data.id,
    title: data.title,
    company: data.company,
    logo: data.logo,
    description: data.description,
    location: data.location,
    city: data.city,
    state: data.state,
    country: data.country,
    job_type: data.job_type,
    salary_min: data.salary_min,
    salary_max: data.salary_max,
    salary_curr: data.salary_curr,
    exp_min: null,
    exp_max: null,
    exp_unit: null,
    skills: data.skills ?? [],
    posted_date: data.posted_date,
    url: data.apply_url,
  };
}

async function getJob(slug: string): Promise<PublicJob | null> {
  const own = await getOwnJobBySlug(slug);
  if (own) return own;
  return getArthaJobBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const job = await getJob(params.slug);
  if (!job) return { title: "Job not found" };

  const title = `${job.title} at ${job.company}`;
  const plainDescription = htmlToText(job.description, 160);
  const url = `${SITE_URL}/jobs/${job.slug}`;

  return {
    title,
    description: plainDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "JobNetWork",
      title,
      description: plainDescription,
      images: job.logo ? [{ url: job.logo }] : [{ url: `${SITE_URL}/Logo.png` }],
    },
    twitter: {
      card: "summary",
      title,
      description: plainDescription,
    },
  };
}

function formatSalary(job: PublicJob) {
  if (!job.salary_min && !job.salary_max) return null;
  const curr = (job.salary_curr ?? "").toUpperCase();
  const isInr = curr === "INR";
  const prefix = isInr ? "₹" : curr ? `${curr} ` : "";
  const fmt = (n: number) =>
    new Intl.NumberFormat(isInr ? "en-IN" : "en-US", {
      maximumFractionDigits: 0,
    }).format(n);
  if (job.salary_min && job.salary_max) {
    return `${prefix}${fmt(job.salary_min)} – ${prefix}${fmt(job.salary_max)}`;
  }
  return `${prefix}${fmt(job.salary_min ?? job.salary_max!)}+`;
}

export default async function JobDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const job = await getJob(params.slug);
  if (!job) notFound();

  const salary = formatSalary(job);
  const sanitizedDescription = sanitizeJobHtml(job.description);

  const matchHref = `/match?job=${encodeURIComponent(
    JSON.stringify({
      title: job.title,
      description: job.description,
      skills: job.skills,
      exp_min: job.exp_min,
      exp_max: job.exp_max,
    })
  )}`;

  // https://schema.org/JobPosting — powers Google for Jobs rich results,
  // which is the single highest-leverage SEO lever available to a job
  // board: individual postings can surface directly in Google's dedicated
  // jobs search UI, not just the ordinary web results list.
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: job.company,
      value: job.slug,
    },
    datePosted: job.posted_date,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      ...(job.logo ? { logo: job.logo } : {}),
    },
    directApply: false,
  };

  if (job.job_type && EMPLOYMENT_TYPE_SCHEMA[job.job_type]) {
    jsonLd.employmentType = EMPLOYMENT_TYPE_SCHEMA[job.job_type];
  }

  if (job.city || job.state || job.country) {
    jsonLd.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.city ? { addressLocality: job.city } : {}),
        ...(job.state ? { addressRegion: job.state } : {}),
        ...(job.country ? { addressCountry: job.country } : {}),
      },
    };
  } else {
    // No location at all typically means remote on Artha's feed.
    jsonLd.jobLocationType = "TELECOMMUTE";
    jsonLd.applicantLocationRequirements = {
      "@type": "Country",
      name: job.country ?? "IN",
    };
  }

  if (job.salary_min || job.salary_max) {
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salary_curr ?? "USD",
      value: {
        "@type": "QuantitativeValue",
        ...(job.salary_min ? { minValue: job.salary_min } : {}),
        ...(job.salary_max ? { maxValue: job.salary_max } : {}),
        unitText: "YEAR",
      },
    };
  }

  return (
    <main className="min-h-screen bg-paper">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-10">
        <Link href="/jobs" className="text-sm text-denim hover:underline">
          ← Back to all jobs
        </Link>

        <div className="mt-4 pinned-card py-6">
          <div className="flex items-start gap-4">
            {job.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.logo}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg border bg-white object-contain p-1"
              />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded-lg bg-board text-white flex items-center justify-center text-lg font-semibold">
                {job.company.charAt(0)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl leading-snug text-ink">
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
                  <span className="text-denim font-medium">{salary}</span>
                )}
              </div>

              {job.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted px-2.5 py-1 text-xs text-ink/80"
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
              className="inline-block rounded-lg bg-board px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0b3a28]"
            >
              Apply →
            </a>
            <Link
              href={matchHref}
              className="inline-block rounded-lg border px-4 py-2 text-sm font-medium text-ink transition hover:bg-muted"
            >
              Match my resume
            </Link>
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
