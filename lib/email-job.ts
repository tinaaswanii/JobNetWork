/**
 * Alert-email runner: welcome retries + daily digests under Brevo's sending limits.
 *
 * Pure logic with injected dependencies (store, sender, job lookup, clock) so it can
 * be unit-tested and dry-run without touching Brevo or the database. The real wiring
 * lives in app/api/cron/email-digest/route.ts and lib/email-job-store.ts.
 *
 * Guarantees:
 *  - Never exceeds the daily cap (counted from welcome_sent_at / last_sent_at timestamps,
 *    so re-runs and overlapping runs see what already went out today).
 *  - Idempotent: a row is CLAIMED (timestamp set) before sending and reverted if the send
 *    fails, so a second run, or a concurrent one, cannot email the same person twice.
 *    If the process dies between claim and send the person misses that one email; that is
 *    deliberate (at-most-once beats a duplicate).
 *  - 401 from Brevo stops the whole run immediately. 429 backs off and retries up to
 *    MAX_RATE_LIMIT_RETRIES times, then stops gracefully.
 *  - Order: welcomes first (oldest signup first), then digests (oldest last_sent_at first,
 *    never-sent first), so unsent people go first on the next run.
 */
import { digestEmail, welcomeEmail, type DigestJob, type SendResult } from "@/lib/email";
import { roleTerms } from "@/lib/role-presets";
import type { JobsQuery } from "@/lib/artha";

export const DEFAULT_DAILY_CAP = 250; // Brevo free plan allows 300/day; keep headroom
export const DIGEST_MIN_GAP_HOURS = 20;
export const SEND_DELAY_MS = 300;
export const MAX_RATE_LIMIT_RETRIES = 3;
export const RATE_LIMIT_BACKOFF_MS = 2000; // 2s, 4s, 8s
export const RUN_TIME_BUDGET_MS = 50_000; // stay inside a serverless function's time limit
export const MAX_CONSECUTIVE_FAILURES = 5;
export const DIGEST_JOB_LIMIT = 10;

export function dailyCap(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.EMAIL_DAILY_CAP);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_DAILY_CAP;
}

export type Subscriber = {
  id: string;
  email: string;
  filters: unknown;
  last_sent_at: string | null;
  created_at?: string;
  unsubscribe_token: string;
};

export interface SubscriberStore {
  /** Emails already sent since `iso` (welcome_sent_at + last_sent_at). */
  countSentSince(iso: string): Promise<number>;
  /** confirmed AND welcome_sent_at IS NULL, oldest signup first. */
  pendingWelcomes(): Promise<Subscriber[]>;
  /** Atomically set welcome_sent_at = now where still null. false = someone else got it. */
  claimWelcome(id: string, nowIso: string): Promise<boolean>;
  /** ok: welcome_error = null. failure: welcome_sent_at = null and store the error text. */
  finishWelcome(id: string, result: { ok: true } | { ok: false; error: string }): Promise<void>;
  /** confirmed, frequency = 'daily', last_sent_at null or older than cutoff; null/oldest first. */
  dueDigests(cutoffIso: string): Promise<Subscriber[]>;
  /** Atomically set last_sent_at = now where it is still null/older than cutoff. */
  claimDigest(id: string, cutoffIso: string, nowIso: string): Promise<boolean>;
  /** Put last_sent_at back after a failed send (only if it still holds our claim). */
  revertDigest(id: string, claimedIso: string, previous: string | null): Promise<void>;
}

export interface EmailJobDeps {
  store: SubscriberStore;
  send(opts: { to: string; subject: string; html: string; unsubscribeToken: string }): Promise<SendResult>;
  findJobs(query: JobsQuery): Promise<DigestJob[]>;
  sleep(ms: number): Promise<void>;
  now(): Date;
  log(line: string): void;
}

export type StopReason = "unauthorized" | "rate_limited" | "quota" | "time_budget" | "too_many_failures";

export type PlannedEmail = { kind: "welcome" | "digest"; email: string; subject: string; jobs?: number };

export interface RunSummary {
  dryRun: boolean;
  cap: number;
  alreadySentToday: number;
  welcomes: { eligible: number; sent: number; failed: number; skipped: number };
  digests: { eligible: number; sent: number; failed: number; skippedNoJobs: number; skipped: number };
  capReached: boolean;
  stopped: StopReason | null;
  planned?: PlannedEmail[]; // dry run only
}

const maskEmail = (e: string) => e.replace(/^(.).*(@.*)$/, "$1***$2");
const utcDayStart = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();

const SORTS = ["newest", "most_relevant", "high_cpa"] as const;

/**
 * Turn a stored filters blob into an Artha/jobs query. Empty strings, null and {} mean
 * "no filter". Stored shape: location, job_type, work_mode, exp_level, niche_keywords
 * (+ q, role, sort_by if present).
 */
export function normalizeAlertFilters(raw: unknown, sinceIso: string): JobsQuery {
  const f = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const q = str(f.q);
  const niche = str(f.niche_keywords) || roleTerms(str(f.role)).join(",");
  const sortRaw = str(f.sort_by);
  let sort_by: (typeof SORTS)[number] = (SORTS as readonly string[]).includes(sortRaw)
    ? (sortRaw as (typeof SORTS)[number])
    : "newest";
  if (sort_by === "most_relevant" && !q) sort_by = "newest";

  const query: JobsQuery = { limit: DIGEST_JOB_LIMIT, offset: 0, posted_after: sinceIso, sort_by };
  const optional: [keyof JobsQuery, string][] = [
    ["q", q],
    ["location", str(f.location)],
    ["job_type", str(f.job_type)],
    ["work_mode", str(f.work_mode)],
    ["exp_level", str(f.exp_level)],
    ["niche_keywords", niche],
  ];
  for (const [k, v] of optional) if (v) (query as Record<string, unknown>)[k] = v;
  return query;
}

type Guarded =
  | { kind: "ok" }
  | { kind: "fail"; error: string }
  | { kind: "stop"; reason: "unauthorized" | "rate_limited" | "quota"; error: string };

async function sendGuarded(deps: EmailJobDeps, mail: Parameters<EmailJobDeps["send"]>[0]): Promise<Guarded> {
  for (let attempt = 0; ; attempt++) {
    const r = await deps.send(mail);
    if (r.ok) return { kind: "ok" };
    const error = `${r.status ?? ""} ${r.error}`.trim().slice(0, 500);
    if (r.status === 401) return { kind: "stop", reason: "unauthorized", error };
    if (r.status === 429) {
      if (attempt >= MAX_RATE_LIMIT_RETRIES) return { kind: "stop", reason: "rate_limited", error };
      await deps.sleep(RATE_LIMIT_BACKOFF_MS * 2 ** attempt);
      continue;
    }
    // Brevo reports an exhausted daily quota in the message body, not with a distinct status.
    if (r.status !== undefined && r.status >= 400 && /daily.*limit|quota|credits/i.test(r.error)) {
      return { kind: "stop", reason: "quota", error };
    }
    return { kind: "fail", error };
  }
}

export async function runEmailJob(
  deps: EmailJobDeps,
  opts: { dryRun?: boolean; cap?: number; timeBudgetMs?: number } = {}
): Promise<RunSummary> {
  const dryRun = !!opts.dryRun;
  const cap = opts.cap ?? dailyCap();
  const budget = opts.timeBudgetMs ?? RUN_TIME_BUDGET_MS;
  const started = deps.now().getTime();
  const { store, log } = deps;

  const summary: RunSummary = {
    dryRun,
    cap,
    alreadySentToday: 0,
    welcomes: { eligible: 0, sent: 0, failed: 0, skipped: 0 },
    digests: { eligible: 0, sent: 0, failed: 0, skippedNoJobs: 0, skipped: 0 },
    capReached: false,
    stopped: null,
    ...(dryRun ? { planned: [] as PlannedEmail[] } : {}),
  };

  summary.alreadySentToday = await store.countSentSince(utcDayStart(deps.now()));
  let remaining = cap - summary.alreadySentToday;
  let consecutiveFailures = 0;

  const outOfRoom = () => {
    if (remaining <= 0) {
      summary.capReached = true;
      return true;
    }
    if (deps.now().getTime() - started > budget) {
      summary.stopped = "time_budget";
      return true;
    }
    return false;
  };

  // Common handling after a guarded send. Returns true when the whole run must stop.
  const afterSend = (g: Guarded, who: string): boolean => {
    if (g.kind === "ok") {
      consecutiveFailures = 0;
      remaining--;
      return false;
    }
    if (g.kind === "stop") {
      summary.stopped = g.reason;
      if (g.reason === "unauthorized") {
        log(`[email-job] STOPPING RUN: Brevo returned 401 (check the API key and the IP allowlist). Not retrying. ${g.error}`);
      } else {
        log(`[email-job] stopping run: Brevo ${g.reason} (${g.error})`);
      }
      return true;
    }
    log(`[email-job] send failed for ${who}: ${g.error}`);
    if (++consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      summary.stopped = "too_many_failures";
      log(`[email-job] stopping run after ${MAX_CONSECUTIVE_FAILURES} consecutive failures`);
      return true;
    }
    return false;
  };

  // ---- 1) Welcome emails that never went out ---------------------------------
  const welcomes = await store.pendingWelcomes();
  summary.welcomes.eligible = welcomes.length;
  for (const sub of welcomes) {
    if (outOfRoom()) break;
    const niche = normalizeAlertFilters(sub.filters, "").niche_keywords;
    const mail = welcomeEmail({ keywords: niche, token: sub.unsubscribe_token });

    if (dryRun) {
      summary.planned!.push({ kind: "welcome", email: sub.email, subject: mail.subject });
      remaining--;
      continue;
    }
    if (!(await store.claimWelcome(sub.id, deps.now().toISOString()))) {
      summary.welcomes.skipped++;
      continue;
    }
    const g = await sendGuarded(deps, { to: sub.email, ...mail, unsubscribeToken: sub.unsubscribe_token });
    if (g.kind === "ok") {
      await store.finishWelcome(sub.id, { ok: true });
      summary.welcomes.sent++;
    } else {
      await store.finishWelcome(sub.id, { ok: false, error: g.error });
      summary.welcomes.failed++;
    }
    if (afterSend(g, `welcome ${maskEmail(sub.email)}`)) break;
    await deps.sleep(SEND_DELAY_MS);
  }

  // ---- 2) Daily digests --------------------------------------------------------
  if (!summary.stopped && remaining > 0) {
    const cutoff = new Date(deps.now().getTime() - DIGEST_MIN_GAP_HOURS * 3_600_000).toISOString();
    const due = await store.dueDigests(cutoff);
    summary.digests.eligible = due.length;

    for (const sub of due) {
      if (outOfRoom()) break;
      const since = sub.last_sent_at ?? new Date(deps.now().getTime() - 24 * 3_600_000).toISOString();

      let jobs: DigestJob[];
      try {
        jobs = await deps.findJobs(normalizeAlertFilters(sub.filters, since));
      } catch (err) {
        summary.digests.failed++;
        log(`[email-job] job lookup failed for ${maskEmail(sub.email)}: ${err instanceof Error ? err.message : "unknown"}`);
        continue;
      }
      if (jobs.length === 0) {
        summary.digests.skippedNoJobs++; // never email an empty digest, and don't mark as sent
        continue;
      }

      const keywords = normalizeAlertFilters(sub.filters, since).niche_keywords;
      const mail = digestEmail({ jobs, keywords, token: sub.unsubscribe_token });

      if (dryRun) {
        summary.planned!.push({ kind: "digest", email: sub.email, subject: mail.subject, jobs: jobs.length });
        remaining--;
        continue;
      }
      const claimedAt = deps.now().toISOString();
      if (!(await store.claimDigest(sub.id, cutoff, claimedAt))) {
        summary.digests.skipped++;
        continue;
      }
      const g = await sendGuarded(deps, { to: sub.email, ...mail, unsubscribeToken: sub.unsubscribe_token });
      if (g.kind === "ok") {
        summary.digests.sent++;
      } else {
        await store.revertDigest(sub.id, claimedAt, sub.last_sent_at);
        summary.digests.failed++;
      }
      if (afterSend(g, `digest ${maskEmail(sub.email)}`)) break;
      await deps.sleep(SEND_DELAY_MS);
    }
  }

  log(
    `[email-job] ${dryRun ? "DRY RUN " : ""}welcomes sent=${summary.welcomes.sent} failed=${summary.welcomes.failed}; ` +
      `digests sent=${summary.digests.sent} skipped(no jobs)=${summary.digests.skippedNoJobs} failed=${summary.digests.failed}; ` +
      `alreadyToday=${summary.alreadySentToday} cap=${cap} capReached=${summary.capReached ? "yes" : "no"}` +
      (summary.stopped ? ` stopped=${summary.stopped}` : "")
  );
  return summary;
}
