# JobNetWork Architecture & Engineering Guide

## Architecture
- Next.js 14 App Router application deployed on Vercel with Node 22 engine.
- Authentication and database hosted on Supabase (`@supabase/ssr` with cookie-based session management).
- Job listings originate from Artha Public Jobs API with automatic fallback to Supabase `cached_jobs` and `own_jobs`.
- Job detail pages are served from `public.cached_jobs` (populated on listings browse, read by `getArthaJobBySlug`).
- Supabase queries on behalf of users use `supabaseServer()` (enforcing RLS). Administrative/cron operations use `supabaseAdmin()`.
