import { NextRequest, NextResponse } from "next/server";
import { getJobsPage } from "@/lib/jobs";
import { emailConfigured, sendEmail, welcomeEmail } from "@/lib/email";
import { runEmailJob, type EmailJobDeps } from "@/lib/email-job";
import { supabaseSubscriberStore } from "@/lib/email-job-store";

// Sequential sends with a delay need room; Vercel Hobby allows up to 60s.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Daily alert-email job (Vercel cron: see vercel.json, 08:00 UTC).
 *
 * Manual run:
 *   curl -H "Authorization: Bearer $CRON_SECRET" "https://<site>/api/cron/email-digest?dry=1"      # dry run, sends nothing
 *   curl -H "Authorization: Bearer $CRON_SECRET" "https://<site>/api/cron/email-digest?test_to=you@example.com"  # one real test email
 *   curl -H "Authorization: Bearer $CRON_SECRET" "https://<site>/api/cron/email-digest"            # full run
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const dryRun = params.get("dry") === "1" || params.get("dry") === "true";
  const testTo = params.get("test_to")?.trim();

  // Single test email: proves Brevo works end to end without touching any subscriber row.
  if (testTo) {
    if (!emailConfigured()) {
      return NextResponse.json({ success: false, error: "BREVO_API_KEY and EMAIL_FROM must be set." }, { status: 500 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testTo)) {
      return NextResponse.json({ success: false, error: "test_to is not a valid email" }, { status: 400 });
    }
    if (dryRun) return NextResponse.json({ success: true, dryRun: true, wouldSendTestTo: testTo });
    const mail = welcomeEmail({ keywords: "test", token: "00000000-0000-0000-0000-000000000000" });
    const r = await sendEmail({ to: testTo, subject: `[TEST] ${mail.subject}`, html: mail.html });
    console.log(`[email-job] test email ${r.ok ? "sent" : `failed (${r.status ?? "network"})`}`);
    return NextResponse.json(r.ok ? { success: true, testSent: true } : { success: false, status: r.status, error: r.error }, {
      status: r.ok ? 200 : 502,
    });
  }

  if (!dryRun && !emailConfigured()) {
    console.error("[email-job] BREVO_API_KEY / EMAIL_FROM not set, skipping run");
    return NextResponse.json({ success: false, error: "BREVO_API_KEY and EMAIL_FROM must be set." }, { status: 500 });
  }

  const deps: EmailJobDeps = {
    store: supabaseSubscriberStore(),
    send: sendEmail,
    // getJobsPage adds the cached-jobs fallback and enforces the posted-after window.
    findJobs: async (q) => (await getJobsPage(q)).items,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    now: () => new Date(),
    log: (l) => console.log(l),
  };

  try {
    const summary = await runEmailJob(deps, { dryRun });
    return NextResponse.json({ success: summary.stopped !== "unauthorized", ...summary });
  } catch (err) {
    console.error("[email-job] run crashed:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ success: false, error: "run failed" }, { status: 500 });
  }
}
