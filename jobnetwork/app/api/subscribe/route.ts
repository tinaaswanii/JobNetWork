import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, filters } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Valid email required.",
        },
      },
      { status: 400 }
    );
  }

  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.error("[api/subscribe] Resend environment variables not configured");

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MISSING_CONFIG",
          message: "Email service is not configured.",
        },
      },
      { status: 500 }
    );
  }

  const db = supabaseAdmin();

  const { error } = await db
    .from("subscribers")
    .upsert(
      {
        email: email.trim().toLowerCase(),
        filters: filters ?? {},
        confirmed: true,
      },
      { onConflict: "email" }
    );

  if (error) {
    console.error("[api/subscribe] supabase error", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Couldn't save subscription.",
        },
      },
      { status: 500 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error: emailError } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email.trim().toLowerCase(),
    subject: "JobNetWork email alerts are active",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2>JobNetWork email alerts are active</h2>
        <p>
          You are now subscribed to receive new jobs matching your selected filters.
        </p>
        <p>
          We’ll email you when new matching jobs are available.
        </p>
        <p style="margin-top:24px;">
          — JobNetWork
        </p>
      </div>
    `,
  });

  if (emailError) {
    console.error("[api/subscribe] Resend error", emailError);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EMAIL_ERROR",
          message: "Subscription was saved, but the confirmation email could not be sent.",
        },
      },
      { status: 500 }
    );
  }

  console.log(`[api/subscribe] email sent to ${email}, id=${data?.id}`);

  return NextResponse.json({
    success: true,
    emailId: data?.id,
  });
}
