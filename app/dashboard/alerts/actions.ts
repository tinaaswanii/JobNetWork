"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase";
import { emailConfigured, sendEmail, welcomeEmail } from "@/lib/email";

export type AlertInput = {
  enabled: boolean;
  keywords: string;
  location: string;
  job_type: string;
  work_mode: string;
};
export type AlertResult = { ok: true; welcomeSent: boolean } | { ok: false; error: string };

const clip = (s: string, n: number) => s.trim().slice(0, n);

/**
 * The subscriber email is ALWAYS the verified session email, never a value from
 * the client. The subscribers table has RLS on with no policies, so it's reached
 * with the service-role client — safe here because the row is pinned to the
 * authenticated user's own address.
 */
export async function saveAlerts(input: AlertInput): Promise<AlertResult> {
  const user = await getUser();
  if (!user?.email) return { ok: false, error: "Your session expired. Please sign in again." };

  const keywords = clip(input.keywords, 200);
  if (input.enabled && !keywords) return { ok: false, error: "Add at least one keyword so we know what to match." };

  const filters = {
    niche_keywords: keywords || undefined,
    location: clip(input.location, 100) || undefined,
    job_type: clip(input.job_type, 50) || undefined,
    work_mode: clip(input.work_mode, 50) || undefined,
  };

  const db = supabaseAdmin();
  const email = user.email.toLowerCase();
  const { data: sub, error } = await db
    .from("subscribers")
    .upsert({ email, user_id: user.id, filters, confirmed: input.enabled }, { onConflict: "email" })
    .select("id, welcome_sent_at, unsubscribe_token")
    .single();
  if (error || !sub) return { ok: false, error: "Couldn't save your alerts. Please try again." };

  let welcomeSent = false;
  if (input.enabled && !sub.welcome_sent_at && emailConfigured()) {
    const mail = welcomeEmail({ keywords, token: sub.unsubscribe_token });
    const r = await sendEmail({ to: email, ...mail, unsubscribeToken: sub.unsubscribe_token });
    if (r.ok) {
      welcomeSent = true;
      await db.from("subscribers").update({ welcome_sent_at: new Date().toISOString(), welcome_error: null }).eq("id", sub.id);
    } else {
      await db.from("subscribers").update({ welcome_error: `${r.status ?? ""} ${r.error}`.trim().slice(0, 500) }).eq("id", sub.id);
    }
  }

  revalidatePath("/dashboard/alerts");
  return { ok: true, welcomeSent };
}
