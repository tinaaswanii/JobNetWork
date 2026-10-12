import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { emailConfigured, sendEmail, welcomeEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email, filters } = await req.json().catch(() => ({}));

  if (!email || typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Valid email required." } },
      { status: 400 }
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = supabaseAdmin();

  // Save the subscription FIRST — that's what matters. The welcome email is
  // best-effort and never blocks it, but its outcome is now RECORDED
  // (welcome_sent_at / welcome_error) and failed ones are retried by the daily cron.
  const { data: sub, error } = await db
    .from("subscribers")
    .upsert({ email: cleanEmail, filters: filters ?? {}, confirmed: true }, { onConflict: "email" })
    .select("id, welcome_sent_at, unsubscribe_token")
    .single();

  if (error || !sub) {
    console.error("[api/subscribe] supabase error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Couldn't save subscription." } },
      { status: 500 }
    );
  }

  if (sub.welcome_sent_at) return NextResponse.json({ success: true, emailSent: true, alreadyWelcomed: true });

  if (!emailConfigured()) {
    console.warn("[api/subscribe] BREVO_API_KEY / EMAIL_FROM missing — welcome email skipped");
    await db.from("subscribers").update({ welcome_error: "Email not configured (BREVO_API_KEY / EMAIL_FROM)" }).eq("id", sub.id);
    return NextResponse.json({ success: true, emailSent: false });
  }

  const mail = welcomeEmail({ keywords: filters?.niche_keywords, token: sub.unsubscribe_token });
  const result = await sendEmail({ to: cleanEmail, ...mail, unsubscribeToken: sub.unsubscribe_token });

  if (result.ok) {
    await db.from("subscribers").update({ welcome_sent_at: new Date().toISOString(), welcome_error: null }).eq("id", sub.id);
    return NextResponse.json({ success: true, emailSent: true });
  }

  console.error(`[api/subscribe] Brevo send failed (${result.status ?? "network"}): ${result.error}`);
  await db.from("subscribers").update({ welcome_error: `${result.status ?? ""} ${result.error}`.trim().slice(0, 500) }).eq("id", sub.id);
  return NextResponse.json({ success: true, emailSent: false });
}
