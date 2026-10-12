import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const page = (title: string, body: string, status = 200) =>
  new NextResponse(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
     <body style="font-family:Arial,sans-serif;max-width:480px;margin:15vh auto;padding:0 24px;color:#0E1B14">
     <h2>${title}</h2><p>${body}</p><p><a href="/jobs" style="color:#0E4A33">Back to JobNetWork</a></p></body>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } }
  );

/** One-click unsubscribe; the unguessable per-subscriber token is the credential. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!UUID_RE.test(token)) return page("Invalid link", "This unsubscribe link isn't valid.", 400);

  const { data, error } = await supabaseAdmin()
    .from("subscribers")
    .update({ confirmed: false })
    .eq("unsubscribe_token", token)
    .select("id");
  if (error) return page("Something went wrong", "Please try again in a moment.", 500);
  if (!data?.length) return page("Link not recognised", "This link is invalid or already used.", 404);
  return page("You're unsubscribed", "You won't get any more job alert emails from us.");
}

// Mail clients that support RFC 8058 one-click send a POST.
export const POST = GET;
