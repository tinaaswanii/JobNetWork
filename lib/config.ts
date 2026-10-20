// Site-wide settings that need a human decision.

// Contact details, defined once. Values are unchanged from before this file
// existed; the footer, /about and "Report this job" all read them from here.

// TODO(owner): consider a professional address on your own domain (for example
// hello@yourdomain) instead of a personal Gmail, then change it here only.
export const CONTACT_EMAIL = "thedigitalldreamerr@gmail.com";

// WhatsApp number used for feedback (international format, digits only).
export const FEEDBACK_WHATSAPP_NUMBER = "916262158299";
export const FEEDBACK_WHATSAPP_URL = `https://wa.me/${FEEDBACK_WHATSAPP_NUMBER}`;

// TODO(owner): "Report this job" emails go to CONTACT_EMAIL for now. Set a
// dedicated address here if you want reports separated from general mail.
export const REPORT_JOB_EMAIL = CONTACT_EMAIL;

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
