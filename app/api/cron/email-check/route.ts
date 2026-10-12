import { NextRequest, NextResponse } from "next/server";
import { emailConfigured, parseFrom, sendEmail } from "@/lib/email";

/**
 * Health check for the Brevo setup. Same secret as the other cron routes:
 *   /api/cron/email-check?key=<CRON_SECRET>               -> checks key, account, sender
 *   /api/cron/email-check?key=<CRON_SECRET>&to=you@x.com  -> also sends a real test email
 * Never returns the API key.
 */
export async function GET(req: NextRequest) {
  const provided = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? req.nextUrl.searchParams.get("key");
  if (!process.env.CRON_SECRET || provided !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const key = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  const report: Record<string, unknown> = {
    env: {
      BREVO_API_KEY: key ? "set" : "MISSING",
      EMAIL_FROM: from ?? "MISSING",
      RESEND_API_KEY: process.env.RESEND_API_KEY
        ? "set (unused — this app sends with Brevo, not Resend)"
        : "not set",
    },
  };
  const problems: string[] = [];
  if (!key) problems.push("BREVO_API_KEY is not set in this environment (Vercel → Settings → Environment Variables, then redeploy).");
  if (!from) problems.push("EMAIL_FROM is not set, e.g. JobNetWork <you@yourdomain.com>.");

  if (key) {
    const h = { "api-key": key, accept: "application/json" };
    try {
      const acc = await fetch("https://api.brevo.com/v3/account", { headers: h });
      if (acc.ok) {
        const a = await acc.json();
        report.account = {
          ok: true,
          plan: (a.plan ?? []).map((p: { type: string; credits?: number }) => ({ type: p.type, credits: p.credits })),
        };
      } else {
        report.account = { ok: false, status: acc.status, body: (await acc.text()).slice(0, 300) };
        problems.push(
          acc.status === 401
            ? "Brevo rejected the API key (401). Create a new API key (not an SMTP password) and update BREVO_API_KEY."
            : `Brevo account check failed (${acc.status}).`
        );
      }

      const sen = await fetch("https://api.brevo.com/v3/senders", { headers: h });
      if (sen.ok) {
        const s = (await sen.json()).senders ?? [];
        const list = s.map((x: { email: string; active: boolean }) => ({ email: x.email, active: x.active }));
        const fromEmail = from ? parseFrom(from).email.toLowerCase() : null;
        const match = list.find((x: { email: string }) => x.email.toLowerCase() === fromEmail);
        report.senders = { list, fromEmailRegistered: !!match, fromEmailActive: !!match?.active };
        if (fromEmail && !match)
          problems.push(`EMAIL_FROM address (${fromEmail}) is not a sender in Brevo. Add and verify it under Senders, Domains & Dedicated IPs.`);
        else if (match && !match.active)
          problems.push(`Sender ${fromEmail} exists but is not verified yet. Click the verification link Brevo emailed.`);
      } else {
        report.senders = { ok: false, status: sen.status };
      }
    } catch (e) {
      problems.push(`Couldn't reach Brevo: ${e instanceof Error ? e.message : "network error"}`);
    }
  }

  const to = req.nextUrl.searchParams.get("to");
  if (to && emailConfigured()) {
    report.testSend = await sendEmail({
      to,
      subject: "JobNetWork email test",
      html: "<p>If you can read this, Brevo sending works.</p>",
    });
    if (!(report.testSend as { ok: boolean }).ok) problems.push("Test email failed — see testSend.error.");
  }

  return NextResponse.json({ ok: problems.length === 0, problems, ...report });
}
