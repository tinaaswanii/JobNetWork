import { NextRequest, NextResponse } from "next/server";
import { fetchJobs } from "@/lib/artha";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.BREVO_API_KEY) {
    console.error("[email-digest] BREVO_API_KEY not set — skipping run");
    return NextResponse.json(
      { success: false, error: { code: "MISSING_CONFIG", message: "BREVO_API_KEY not set." } },
      { status: 500 }
    );
  }

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

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: parseFromHeader(process.env.EMAIL_FROM ?? "JobNetWork <jobs@example.com>"),
          to: [{ email: sub.email }],
          subject: `${items.length} new job${items.length > 1 ? "s" : ""} matching your filters`,
          htmlContent: renderDigestHtml(items),
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Brevo send failed (${res.status}): ${body}`);
      }

      await db.from("subscribers").update({ last_sent_at: new Date().toISOString() }).eq("id", sub.id);
      sent++;
    } catch (err) {
      console.error(`[email-digest] failed for ${sub.email}`, err);
      // keep going — one subscriber's failure shouldn't block the rest
    }
  }

  return NextResponse.json({ success: true, sent });
}

// Turns "JobNetWork <jobs@example.com>" into Brevo's {name, email} shape.
function parseFromHeader(value: string): { name?: string; email: string } {
  const match = value.match(/^(.*)<(.+)>$/);
  if (match) {
    return { name: match[1].trim() || undefined, email: match[2].trim() };
  }
  return { email: value.trim() };
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
