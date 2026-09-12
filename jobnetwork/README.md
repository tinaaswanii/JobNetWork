# JobNetWork — student job listings (artha.link + your own postings)

Stack: **Next.js 14 (App Router) + Supabase (Postgres/Auth) + Vercel (hosting + cron) + Resend (email digests)**.
Reasoning: it's the fastest path for a solo founder to a real production site —
Supabase gives you a database, auth, and a dashboard without running your own server;
Vercel gives you hosting + built-in cron for the email digest and price scrape jobs; both have generous free tiers.

## What's in here

```
app/
  api/
    jobs/route.ts              -> proxies artha.link, merges in your own manually-added jobs
    jobs/filters/route.ts      -> proxies artha.link's filter option lists
    cron/email-digest/route.ts -> sends the "new jobs matching your filters" email
    cron/price-scrape/route.ts -> refreshes the scraped price/salary reference table
  jobs/page.tsx                -> the public listing page (filters + pagination + cards)
components/
  JobCard.tsx, FilterBar.tsx, Pagination.tsx, EmailSignup.tsx
lib/
  artha.ts        -> artha.link API client with 429 backoff
  supabase.ts     -> Supabase server client
  types.ts        -> shared types
supabase/schema.sql -> tables for your own jobs, email subscribers, scraped prices
.env.example
```

## Setup

1. `npx create-next-app@latest` already assumed — drop these files into that project (or `npm install` here once you add a package.json/tsconfig; this scaffold assumes Next 14 + TypeScript + Tailwind, all defaults from `create-next-app`).
2. Create a free Supabase project, run `supabase/schema.sql` in its SQL editor.
3. Copy `.env.example` to `.env.local` and fill in real values.
4. `npm run dev` locally, then push to GitHub and import into Vercel for a live URL (Vercel gives you `yourproject.vercel.app` immediately; add a custom domain in Vercel's dashboard whenever you buy one).
5. Add the two cron jobs in `vercel.json` (included) so Vercel calls your digest and price-scrape endpoints on a schedule automatically — no server to babysit.

## Where the artha.link token lives

Set `ARTHA_API_KEY` as a Vercel **environment variable** (Project Settings → Environment Variables), never in client code. Every call to artha.link happens inside `app/api/jobs/route.ts`, which runs on the server — the browser never sees the key. This also means you can rotate the key without redeploying your frontend.

## "Scraping prices from other sites"

I've stubbed this as a scheduled job (`app/api/cron/price-scrape/route.ts`) rather than building it in full, because it needs decisions only you can make:

- **Which sites, which fields.** Salary benchmarks? Internship stipends? Course/bootcamp prices? Each target site has different HTML, so the scraper is site-specific — I can write the actual selectors once you tell me the 2–3 sources you want.
- **Legal/ToS check first.** Scraping public pages is common practice, but check each target's `robots.txt` and Terms of Service before scraping it — some explicitly prohibit it, and a few (LinkedIn, Indeed) actively rate-limit or block scrapers and have pursued legal action against scrapers in the past. Safer sources: sites with an official API or open data feed, or sites whose ToS is silent/permissive on scraping.
- **Be a polite scraper.** Cache aggressively (don't hit a source more than once every few hours), set a real User-Agent identifying your bot, and respect `Retry-After`/429s exactly like you do for artha.link.

The stub uses `cheerio` for static HTML; if a target site needs JS rendering, swap in `playwright` (heavier, needs a different Vercel runtime — happy to wire that up once you pick sources).

## Email automation (new-jobs digest)

`components/EmailSignup.tsx` collects an email + saved filters into the `subscribers` table. `app/api/cron/email-digest/route.ts` runs daily (see `vercel.json`), pulls jobs posted since each subscriber's `last_sent_at`, and sends via Resend (resend.com — 3,000 free emails/month, dead simple API, better deliverability out of the box than raw SMTP). Swap in SendGrid/Postmark if you prefer; the calling code is a 10-line change.

## Monetization notes (from what's live in 2026)

- Layer models rather than picking one: paid postings from employers who want visibility beyond your free aggregated feed, featured/pinned listings, an employer "campus branding" package (a company pays to look good to students even when not actively hiring), and Google AdSense once you have real traffic (AdSense pays little until volume is meaningful — treat it as a late add-on, not the plan).
- A student-niche board's differentiator against Indeed/LinkedIn is depth on *this* audience: entry-level/internship filters, verified-student perks, campus-specific companies. Lean into that in your UI and copy rather than looking like a generic aggregator.
- **Disclosure:** because job links are monetized/affiliate-tracked, add one line to your Terms/footer (e.g. "Some listings on this site may be sponsored or earn us a referral fee when you apply.") — this satisfies FTC-style disclosure norms without naming any specific partner. It's a small addition that avoids a real legal/reputational risk later.

## Deployment checklist (to actually go live)

1. Push this repo to GitHub.
2. Import into Vercel → set env vars → Deploy. You get a live `https://<project>.vercel.app` URL immediately.
3. Point a real domain at it (Vercel → Domains) once you buy one (Namecheap/Google Domains/Vercel itself).
4. Apply for Google AdSense **after** the site is live with real content and some traffic — new sites with mostly third-party/aggregated content are commonly rejected on first try; having your own original job posts and a few content pages (About, career-tips articles) helps approval.
