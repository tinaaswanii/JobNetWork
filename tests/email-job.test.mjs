import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runEmailJob, normalizeAlertFilters, dailyCap } from "../lib/email-job.ts";

const NOW = new Date("2026-10-31T08:00:00Z");
const job = { title: "Dev", company: "Acme", location: "Remote", url: "https://x.test/1" };

function makeStore(seed) {
  const rows = seed.map((r) => ({ confirmed: true, welcome_sent_at: "2026-09-01T00:00:00Z", last_sent_at: null, filters: {}, unsubscribe_token: "tok-" + r.id, ...r }));
  const byId = (id) => rows.find((r) => r.id === id);
  return {
    rows,
    async countSentSince(iso) {
      return rows.filter((r) => r.welcome_sent_at && r.welcome_sent_at >= iso).length + rows.filter((r) => r.last_sent_at && r.last_sent_at >= iso).length;
    },
    async pendingWelcomes() {
      return rows.filter((r) => r.confirmed && !r.welcome_sent_at).map((r) => ({ ...r, email: r.email ?? `${r.id}@t.test` }));
    },
    async claimWelcome(id, nowIso) { const r = byId(id); if (r.welcome_sent_at) return false; r.welcome_sent_at = nowIso; return true; },
    async finishWelcome(id, res) { const r = byId(id); if (res.ok) r.welcome_error = null; else { r.welcome_sent_at = null; r.welcome_error = res.error; } },
    async dueDigests(cutoff) {
      return rows
        .filter((r) => r.confirmed && r.frequency === "daily" && (!r.last_sent_at || r.last_sent_at < cutoff))
        .sort((a, b) => (a.last_sent_at ?? "").localeCompare(b.last_sent_at ?? ""))
        .map((r) => ({ ...r, email: r.email ?? `${r.id}@t.test` }));
    },
    async claimDigest(id, cutoff, nowIso) { const r = byId(id); if (r.last_sent_at && r.last_sent_at >= cutoff) return false; r.last_sent_at = nowIso; return true; },
    async revertDigest(id, claimed, prev) { const r = byId(id); if (r.last_sent_at === claimed) r.last_sent_at = prev; },
  };
}

function deps(store, over = {}) {
  const sent = [];
  const logs = [];
  return {
    sent, logs,
    d: {
      store,
      send: async (m) => { sent.push(m.to); return { ok: true }; },
      findJobs: async () => [job],
      sleep: async () => {},
      now: () => NOW,
      log: (l) => logs.push(l),
      ...over,
    },
  };
}

describe("email job", () => {
  it("normalizeAlertFilters treats '' and {} as no filter", () => {
    const q = normalizeAlertFilters({ location: "", job_type: "", exp_level: " ", niche_keywords: "" }, "2026-10-30T00:00:00Z");
    assert.deepEqual(Object.keys(q).sort(), ["limit", "offset", "posted_after", "sort_by"]);
    assert.equal(Object.keys(normalizeAlertFilters({}, "s")).includes("q"), false);
    const f = normalizeAlertFilters({ job_type: "internship", location: "Pune", q: "react", sort_by: "most_relevant" }, "s");
    assert.equal(f.job_type, "internship"); assert.equal(f.sort_by, "most_relevant");
  });

  it("retries failed welcomes, clears error on success, records error and continues on failure", async () => {
    const store = makeStore([
      { id: "a", welcome_sent_at: null, welcome_error: "old" },
      { id: "b", welcome_sent_at: null },
      { id: "c", welcome_sent_at: null },
    ]);
    const { d, sent } = deps(store, {
      send: async (m) => (m.to === "b@t.test" ? { ok: false, status: 400, error: "bad address" } : (sent_push(m), { ok: true })),
    });
    function sent_push() {}
    const s = await runEmailJob(d, { cap: 10 });
    assert.equal(s.welcomes.sent, 2); assert.equal(s.welcomes.failed, 1);
    assert.ok(store.rows[0].welcome_sent_at); assert.equal(store.rows[0].welcome_error, null);
    assert.equal(store.rows[1].welcome_sent_at, null); assert.match(store.rows[1].welcome_error, /400 bad address/);
    assert.ok(store.rows[2].welcome_sent_at);
  });

  it("digest: only daily, due rows; skips when no jobs; sets last_sent_at only on send", async () => {
    const old = "2026-10-30T00:00:00Z"; // 32h ago
    const recent = "2026-10-30T20:00:00Z"; // 12h ago
    const store = makeStore([
      { id: "due", frequency: "daily", last_sent_at: old },
      { id: "recent", frequency: "daily", last_sent_at: recent },
      { id: "weekly", frequency: "weekly" },
      { id: "nojobs", frequency: "daily", filters: { q: "none" } },
      { id: "unconf", frequency: "daily", confirmed: false },
    ]);
    const { d, sent } = deps(store, { findJobs: async (q) => (q.q === "none" ? [] : [job]) });
    const s = await runEmailJob(d, { cap: 10 });
    assert.deepEqual(sent.sort(), ["due@t.test"]);
    assert.equal(s.digests.skippedNoJobs, 1);
    assert.equal(store.rows.find((r) => r.id === "nojobs").last_sent_at, null);
    assert.equal(store.rows.find((r) => r.id === "due").last_sent_at, NOW.toISOString());
  });

  it("is idempotent: a second run sends nothing", async () => {
    const store = makeStore([{ id: "a", frequency: "daily", welcome_sent_at: null }, { id: "b", frequency: "daily" }]);
    const first = deps(store);
    await runEmailJob(first.d, { cap: 10 });
    assert.equal(first.sent.length, 3);
    const second = deps(store);
    await runEmailJob(second.d, { cap: 10 });
    assert.equal(second.sent.length, 0);
  });

  it("respects the cap incl. emails already sent today; welcomes first; oldest digest first", async () => {
    const store = makeStore([
      { id: "w1", frequency: "weekly", welcome_sent_at: null },
      { id: "new", frequency: "daily", last_sent_at: "2026-10-30T01:00:00Z" },
      { id: "oldest", frequency: "daily", last_sent_at: "2026-10-29T01:00:00Z" },
      { id: "never", frequency: "daily" },
      { id: "today", frequency: "weekly", last_sent_at: "2026-10-31T01:00:00Z" }, // counts toward today's cap
    ]);
    const { d, sent } = deps(store);
    const s = await runEmailJob(d, { cap: 4 }); // 1 already today -> 3 left
    assert.deepEqual(sent, ["w1@t.test", "never@t.test", "oldest@t.test"]);
    assert.equal(s.capReached, true);
    assert.equal(s.alreadySentToday, 1);
  });

  it("401 stops the whole run at once, no retries, row reverted", async () => {
    const store = makeStore([{ id: "a", frequency: "daily" }, { id: "b", frequency: "daily" }]);
    let calls = 0;
    const { d, logs } = deps(store, { send: async () => (calls++, { ok: false, status: 401, error: "unrecognised IP address" }) });
    const s = await runEmailJob(d, { cap: 10 });
    assert.equal(calls, 1); assert.equal(s.stopped, "unauthorized");
    assert.equal(store.rows[0].last_sent_at, null);
    assert.ok(logs.some((l) => /401/.test(l)));
  });

  it("429 backs off and retries up to 3 times then stops gracefully", async () => {
    const store = makeStore([{ id: "a", frequency: "daily" }, { id: "b", frequency: "daily" }]);
    let calls = 0; const sleeps = [];
    const { d } = deps(store, { send: async () => (calls++, { ok: false, status: 429, error: "rate" }), sleep: async (ms) => { sleeps.push(ms); } });
    const s = await runEmailJob(d, { cap: 10 });
    assert.equal(calls, 4); // 1 try + 3 retries
    assert.deepEqual(sleeps.slice(0, 3), [2000, 4000, 8000]);
    assert.equal(s.stopped, "rate_limited");
    assert.equal(store.rows[0].last_sent_at, null);
  });

  it("429 that clears on retry still sends", async () => {
    const store = makeStore([{ id: "a", frequency: "daily" }]);
    let n = 0;
    const { d } = deps(store, { send: async () => (n++ === 0 ? { ok: false, status: 429, error: "rate" } : { ok: true }) });
    const s = await runEmailJob(d, { cap: 10 });
    assert.equal(s.digests.sent, 1); assert.equal(s.stopped, null);
  });

  it("dry run sends nothing, writes nothing, lists who would get what", async () => {
    const store = makeStore([{ id: "w", frequency: "weekly", welcome_sent_at: null }, { id: "d", frequency: "daily" }]);
    const { d, sent } = deps(store);
    const s = await runEmailJob(d, { cap: 10, dryRun: true });
    assert.equal(sent.length, 0);
    assert.equal(store.rows[0].welcome_sent_at, null); assert.equal(store.rows[1].last_sent_at, null);
    assert.deepEqual(s.planned.map((p) => [p.kind, p.email]), [["welcome", "w@t.test"], ["digest", "d@t.test"]]);
  });

  it("dailyCap defaults to 250 and honours EMAIL_DAILY_CAP", () => {
    assert.equal(dailyCap({}), 250);
    assert.equal(dailyCap({ EMAIL_DAILY_CAP: "100" }), 100);
    assert.equal(dailyCap({ EMAIL_DAILY_CAP: "abc" }), 250);
  });
});
