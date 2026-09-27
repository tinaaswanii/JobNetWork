import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, filters } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Valid email required." },
      },
      { status: 400 }
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = supabaseAdmin();

  // Save the subscription FIRST, unconditionally — this is the part that actually
  // matters (you get matched jobs by email going forward). Whether the one-time
  // "you're subscribed" confirmation email sends successfully is secondary and
  // should never block this from working.
  const { error } = await db
    .from("subscribers")
    .upsert(
      { email: cleanEmail, filters: filters ?? {}, confirmed: true },
      { onConflict: "email" }
    );

  if (error) {
    console.error("[api/subscribe] supabase error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Couldn't save subscription." } },
      { status: 500 }
    );
  }

  // Confirmation email is best-effort from here — if Brevo isn't configured or the
  // send fails, the subscription is still saved and the person still gets matches
  // from the digest cron; we just log it instead of failing the whole request.
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
    console.warn("[api/subscribe] Brevo not configured — subscription saved, confirmation email skipped");
    return NextResponse.json({ success: true, emailSent: false });
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: parseFromHeader(process.env.EMAIL_FROM),
        to: [{ email: cleanEmail }],
        subject: "JobNetWork email alerts are active",
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;">
            <h2>JobNetWork email alerts are active</h2>
            <p>You are now subscribed to receive new jobs matching your selected filters.</p>
            <p>We'll email you when new matching jobs are available.</p>
            <p style="margin-top:24px;">— JobNetWork</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[api/subscribe] Brevo send failed (${res.status}): ${body}`);
      return NextResponse.json({ success: true, emailSent: false });
    }

    return NextResponse.json({ success: true, emailSent: true });
  } catch (err) {
    console.error("[api/subscribe] Brevo error", err);
    return NextResponse.json({ success: true, emailSent: false });
  }
}

function parseFromHeader(value: string): { name?: string; email: string } {
  const match = value.match(/^(.*)<(.+)>$/);
  if (match) {
    return { name: match[1].trim() || undefined, email: match[2].trim() };
  }
  return { email: value.trim() };
}
