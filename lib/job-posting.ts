import type { PublicJob } from "@/lib/types";

// schema.org/JobPosting, built ONLY from values the data really has.
//
// Returns null unless every required field is present: title, description,
// a real posted date, hiring organisation, a real job location (city, state or
// country; never guessed or defaulted to "remote") and an expiry
// (validThrough or equivalent). The job feed and our own_jobs table currently
// have no expiry field, so this returns null for every job today. When an
// expiry becomes available, pass it as `validThrough` and the markup returns.
// TODO(owner): ask the job feed provider whether it can supply an expiry date.

const EMPLOYMENT_TYPE: Record<string, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
  temporary: "TEMPORARY",
  freelance: "CONTRACTOR",
};

// Own jobs without a date fall back to 1970; that is "unknown", not a date.
function realDate(s: string | null | undefined) {
  if (!s) return null;
  const t = new Date(s).getTime();
  return Number.isNaN(t) || t < Date.UTC(2000, 0, 1) ? null : new Date(t).toISOString();
}

export function buildJobPostingJsonLd(
  job: PublicJob,
  extra: { validThrough?: string | null } = {}
): Record<string, unknown> | null {
  const datePosted = realDate(job.posted_date);
  const validThrough = realDate(extra.validThrough);
  const hasLocation = Boolean(job.city || job.state || job.country);

  if (!job.title || !job.description?.trim() || !datePosted || !job.company || !hasLocation || !validThrough) {
    return null;
  }

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: { "@type": "PropertyValue", name: job.company, value: job.slug },
    datePosted,
    validThrough,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      ...(job.logo ? { logo: job.logo } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.city ? { addressLocality: job.city } : {}),
        ...(job.state ? { addressRegion: job.state } : {}),
        ...(job.country ? { addressCountry: job.country } : {}),
      },
    },
    directApply: false,
  };

  if (job.job_type && EMPLOYMENT_TYPE[job.job_type]) ld.employmentType = EMPLOYMENT_TYPE[job.job_type];

  // Salary only when the currency is known; the pay period is not in the data,
  // so no unitText is guessed and no baseSalary is emitted without one.
  return ld;
}
