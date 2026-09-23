import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { fetchJobs } from "@/lib/artha";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[email-digest] RESEND_API_KEY not set — skipping run");
    return NextResponse.json(
      { success: false, error: { code: "MISSING_CONFIG", message: "RESEND_API_KEY not set." } },
      { status: 500 }
    );
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const db = supabaseAdmin();
  const { data: subscribers, error } = await db
    .from("subscribers")
    .select("*")
    .eq("confirmed", true);

  if (error) {
    console.error("[email-digest] failed to load subscribers", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  let sent = 0;
  for (const sub of subscribers ?? []) {
    const postedAfter = sub.last_sent_at ?? new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    try {
      const { items } = await fetchJobs({
        ...sub.filters,
        posted_after: postedAfter,
        sort_by: "newest",
        limit: 10,
      });

      if (items.length === 0) continue; // don't email an empty digest

      const { data, error: sendError } = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: sub.email,
        subject: `${items.length} new job${items.length > 1 ? "s" : ""} matching your filters`,
        html: renderDigestHtml(items),
      });

      if (sendError) {
        console.error(`[email-digest] Resend failed for ${sub.email}`, sendError);
        continue;
      }

      if (!data?.id) {
        console.error(`[email-digest] Resend returned no email ID for ${sub.email}`);
        continue;
      }

      const { error: updateError } = await db
        .from("subscribers")
        .update({ last_sent_at: new Date().toISOString() })
        .eq("id", sub.id);

      if (updateError) {
        console.error(`[email-digest] failed to update last_sent_at for ${sub.email}`, updateError);
        continue;
      }

      sent++;
    } catch (err) {
      console.error(`[email-digest] failed for ${sub.email}`, err);
      // keep going — one subscriber's failure shouldn't block the rest
    }
  }

  return NextResponse.json({ success: true, sent });
}

function renderDigestHtml(items: Awaited<ReturnType<typeof fetchJobs>>["items"]) {
  const rows = items
    .map(
      (job) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e0d5;">
          <a href="${job.url}" style="font-weight:600;color:#1c1c1c;text-decoration:none;">${job.title}</a>
          <div style="color:#555;font-size:14px;">${job.company} · ${job.location ?? "Remote"}</div>
        </td>
      </tr>`
    )
    .join("");

  return `<table width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}
