# JobNetWork Dashboard — Roadmap

- [x] Phase 1 — Inspect existing project (JobNetWork-Lovable repo: Next.js 14, Supabase tables own_jobs/cached_jobs/subscribers/scraped_prices, no auth, no RLS, no profile/links feature found)
- [x] Phase 2 — Google authentication (Lovable Cloud, /auth page, _authenticated gate, sign-out)
- [x] Phase 3 — Application database (profiles + trigger, applications, interviews, application_activity; RLS + grants)
- [x] Phase 4 — Dashboard + CRUD (/dashboard: list, filter, add, edit, delete, status pipeline, activity logging)
- [x] Phase 5 done — feed live via api-usa.artha.link
- [x] Phase 6 done — interviews CRUD, upcoming reminders card, activity timeline
- [x] Fix: job detail pages 404'd — Artha has no single-job endpoint; added cached_jobs table + cache write on listings, cache-first lookup with slug-search fallback (matches original repo's lib/job-cache.ts)
- [x] Pushed to GitHub: branch `lovable-app` on tinaaswanii/JobNetWork-Lovable (all 104 files verified, plus MIGRATION-NOTES.md); Tina merges into main

Open questions:
- Profile/link management feature not found in repo — location unknown
