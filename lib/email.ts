/**
 * Brevo transactional email (https://developers.brevo.com/reference/sendtransacemail).
 * Server-only: reads BREVO_API_KEY. Never import from a client component.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://job-net-work.vercel.app";

export type SendResult = { ok: true; messageId?: string } | { ok: false; status?: number; error: string };

export function emailConfigured() {
  return !!process.env.BREVO_API_KEY && !!process.env.EMAIL_FROM;
}

/** "JobNetWork <jobs@example.com>" -> Brevo's { name, email } shape. */
export function parseFrom(value: string): { name?: string; email: string } {
  const match = value.match(/^(.*)<(.+)>$/);
  if (match) return { name: match[1].trim().replace(/^"|"$/g, "") || undefined, email: match[2].trim() };
  return { email: value.trim() };
}

export function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export const unsubscribeUrl = (token: string) => `${SITE_URL}/api/unsubscribe?token=${encodeURIComponent(token)}`;

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  unsubscribeToken?: string;
}): Promise<SendResult> {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key) return { ok: false, error: "BREVO_API_KEY is not set" };
  if (!from) return { ok: false, error: "EMAIL_FROM is not set" };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: parseFrom(from),
        to: [{ email: opts.to }],
        subject: opts.subject,
        htmlContent: opts.html,
        ...(opts.unsubscribeToken
          ? { headers: { "List-Unsubscribe": `<${unsubscribeUrl(opts.unsubscribeToken)}>` } }
          : {}),
      }),
    });
    const body = await res.text();
    if (!res.ok) return { ok: false, status: res.status, error: body.slice(0, 500) };
    let messageId: string | undefined;
    try {
      messageId = JSON.parse(body).messageId;
    } catch {}
    return { ok: true, messageId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" };
  }
}

const shell = (inner: string, token?: string) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#0E1B14;">
  ${inner}
  <p style="margin-top:32px;font-size:12px;color:#5C6B62;">
    You're getting this because you signed up for job alerts on JobNetWork.
    ${token ? `<a href="${unsubscribeUrl(token)}" style="color:#5C6B62;">Unsubscribe</a>` : ""}
  </p>
</div>`;

export function welcomeEmail(opts: { keywords?: string; token: string }) {
  const kw = opts.keywords?.trim();
  return {
    subject: "Welcome to JobNetWork — your job alerts are on",
    html: shell(
      `<h2 style="margin:0 0 12px;">Welcome to JobNetWork 👋</h2>
       <p>Your job alerts are active${kw ? ` for <strong>${esc(kw)}</strong>` : ""}. We'll email you when new matching jobs are posted — no spam, and only when there's something new.</p>
       <p><a href="${SITE_URL}/jobs" style="display:inline-block;background:#0E4A33;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Browse jobs now</a></p>
       <p>Tip: <a href="${SITE_URL}/match">match your resume</a> to any job to see how well you fit.</p>`,
      opts.token
    ),
  };
}

export type DigestJob = { title: string; company: string; location: string | null; url: string };

export function digestEmail(opts: { jobs: DigestJob[]; keywords?: string; token: string }) {
  const n = opts.jobs.length;
  const kw = opts.keywords?.trim();
  const rows = opts.jobs
    .map(
      (j) => `<tr><td style="padding:12px 0;border-bottom:1px solid #E2E7E3;">
        <a href="${esc(j.url)}" style="font-weight:600;color:#0E1B14;text-decoration:none;">${esc(j.title)}</a>
        <div style="color:#5C6B62;font-size:14px;">${esc(j.company)} · ${esc(j.location ?? "Remote")}</div>
      </td></tr>`
    )
    .join("");
  return {
    subject: kw
      ? `${n} new ${kw} job${n > 1 ? "s" : ""} on JobNetWork`
      : `${n} new job${n > 1 ? "s" : ""} matching your filters`,
    html: shell(
      `<h2 style="margin:0 0 12px;">${n} new job${n > 1 ? "s" : ""}${kw ? ` for “${esc(kw)}”` : ""}</h2>
       <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
       <p style="margin-top:16px;"><a href="${SITE_URL}/jobs">See all jobs →</a></p>`,
      opts.token
    ),
  };
}
