import { supabaseAdmin } from "@/lib/supabase";
import type { Subscriber, SubscriberStore } from "@/lib/email-job";

const COLS = "id, email, filters, last_sent_at, created_at, unsubscribe_token";
const FETCH_LIMIT = 500;

/** Supabase-backed SubscriberStore (service role; server only). */
export function supabaseSubscriberStore(db = supabaseAdmin()): SubscriberStore {
  const fail = (what: string, error: { message: string } | null) => {
    if (error) throw new Error(`${what}: ${error.message}`);
  };

  return {
    async countSentSince(iso) {
      const [w, d] = await Promise.all([
        db.from("subscribers").select("id", { count: "exact", head: true }).gte("welcome_sent_at", iso),
        db.from("subscribers").select("id", { count: "exact", head: true }).gte("last_sent_at", iso),
      ]);
      fail("count welcomes", w.error);
      fail("count digests", d.error);
      return (w.count ?? 0) + (d.count ?? 0);
    },

    async pendingWelcomes() {
      const { data, error } = await db
        .from("subscribers")
        .select(COLS)
        .eq("confirmed", true)
        .is("welcome_sent_at", null)
        .order("created_at", { ascending: true })
        .limit(FETCH_LIMIT);
      fail("load pending welcomes", error);
      return (data ?? []) as Subscriber[];
    },

    async claimWelcome(id, nowIso) {
      const { data, error } = await db
        .from("subscribers")
        .update({ welcome_sent_at: nowIso })
        .eq("id", id)
        .eq("confirmed", true)
        .is("welcome_sent_at", null)
        .select("id");
      fail("claim welcome", error);
      return (data?.length ?? 0) > 0;
    },

    async finishWelcome(id, result) {
      const patch = result.ok
        ? { welcome_error: null }
        : { welcome_sent_at: null, welcome_error: result.error.slice(0, 500) };
      const { error } = await db.from("subscribers").update(patch).eq("id", id);
      fail("finish welcome", error);
    },

    async dueDigests(cutoffIso) {
      const { data, error } = await db
        .from("subscribers")
        .select(COLS)
        .eq("confirmed", true)
        .eq("frequency", "daily")
        .or(`last_sent_at.is.null,last_sent_at.lt.${cutoffIso}`)
        .order("last_sent_at", { ascending: true, nullsFirst: true })
        .limit(FETCH_LIMIT);
      fail("load due digests", error);
      return (data ?? []) as Subscriber[];
    },

    async claimDigest(id, cutoffIso, nowIso) {
      const { data, error } = await db
        .from("subscribers")
        .update({ last_sent_at: nowIso })
        .eq("id", id)
        .eq("confirmed", true)
        .or(`last_sent_at.is.null,last_sent_at.lt.${cutoffIso}`)
        .select("id");
      fail("claim digest", error);
      return (data?.length ?? 0) > 0;
    },

    async revertDigest(id, claimedIso, previous) {
      const { error } = await db
        .from("subscribers")
        .update({ last_sent_at: previous })
        .eq("id", id)
        .eq("last_sent_at", claimedIso);
      fail("revert digest", error);
    },
  };
}
