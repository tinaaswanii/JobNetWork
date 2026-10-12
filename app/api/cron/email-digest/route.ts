import { NextRequest, NextResponse } from "next/server";
import { fetchJobs } from "@/lib/artha";
import { supabaseAdmin } from "@/lib/supabase";
import { digestEmail, emailConfigured, sendEmail, welcomeEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  if (!emailConfigured()) {
    console.error("[email-digest] BREVO_API_KEY / EMAIL_FROM not set — skipping run");
    return NextResponse.json(
      { success: false, error: { code: "MISSING_CONFIG", message: "BREVO_API_KEY and EMAIL_FROM must be set." } },
      { status: 500 }
    );
  }

  const db = supabaseAdmin();

  // 1) Retry welcome emails that never went out (recent signups only, capped per run).
  let welcomed = 0;
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { data: pending } = await db
    .from("subscribers")
    .select("id, email, filters, unsubscribe_token")
    .eq("confirmed", true)
    .is("welcome_sent_at", null)
    .gte("created_at", since)
    .limit(50);
  for (const s of pending ?? []) {
    const mail = welcomeEmail({ keywords: s.filters?.niche_keywords, token: s.unsubscribe_token });
    const r = await sendEmail({ to: s.email, ...mail, unsubscribeToken: s.unsubscribe_token });
    if (r.ok) {
      await db.from("subscribers").update({ welcome_sent_at: new Date().toISOString(), welcome_error: null }).eq("id", s.id);
      welcomed++;
    } else {
      await db.from("subscribers").update({ welcome_error: `${r.status ?? ""} ${r.error}`.trim().slice(0, 500) }).eq("id", s.id);
    }
  }

  // 2) Job-match digests.
  const { data: subscribers, error } = await db.from("subscribers").select("*").eq("confirmed", true);
  if (error) {
    console.error("[email-digest] failed to load subscribers", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;
  for (const sub of subscribers ?? []) {
    const postedAfter = sub.last_sent_at ?? new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    try {
      const { items } = await fetchJobs({ ...sub.filters, posted_after: postedAfter, sort_by: "newest", limit: 10 });
      if (items.length === 0) continue; // never email an empty digest

      const mail = digestEmail({
        jobs: items,
        keywords: sub.filters?.niche_keywords,
        token: sub.unsubscribe_token,
      });
      const r = await sendEmail({ to: sub.email, ...mail, unsubscribeToken: sub.unsubscribe_token });
      if (!r.ok) throw new Error(`Brevo send failed (${r.status ?? "network"}): ${r.error}`);

      await db.from("subscribers").update({ last_sent_at: new Date().toISOString() }).eq("id", sub.id);
      sent++;
    } catch (err) {
      failed++;
      console.error(`[email-digest] failed for ${sub.email}`, err);
      // one subscriber's failure shouldn't block the rest
    }
  }

  return NextResponse.json({ success: true, welcomed, sent, failed });
}
