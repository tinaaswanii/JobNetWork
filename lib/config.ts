// Site-wide settings that need a human decision.

// TODO(owner): set the address that should receive "Report this job" emails.
// For now this reuses the contact address already shown in the site footer; it
// was not invented, but it may not be where you want reports to go.
export const REPORT_JOB_EMAIL = "thedigitalldreamerr@gmail.com";

export const SITE_URL = "https://job-net-work.vercel.app";

export function reportJobHref(job: { title: string; company: string; slug: string }) {
  const subject = `Report a job: ${job.title} at ${job.company}`;
  const body = [
    "I'd like to report this job listing.",
    "",
    `Job: ${job.title} at ${job.company}`,
    `Link: ${SITE_URL}/jobs/${job.slug}`,
    "",
    "What is wrong with it? (for example: expired, spam, asks for money, misleading)",
    "",
  ].join("\n");
  return `mailto:${REPORT_JOB_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
