create table if not exists own_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  logo text,
  description text not null,
  location text,
  city text,
  state text,
  country text,
  job_type text,
  work_mode text,
  salary_min numeric,
  salary_max numeric,
  salary_curr text default 'USD',
  skills text[] default '{}',
  apply_url text not null,
  posted_date timestamptz not null default now(),
  is_active boolean not null default true
);

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  filters jsonb not null default '{}',
  frequency text not null default 'daily',
  last_sent_at timestamptz,
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists scraped_prices (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  label text not null,
  price numeric,
  currency text default 'USD',
  url text,
  scraped_at timestamptz not null default now()
);

-- Passive cache of every Artha-sourced job we've ever shown in a listing,
-- keyed by Artha's own slug. Artha's public API has no single-job lookup
-- endpoint (only a list + filters endpoint), so without this there is no
-- way to serve a stable, indexable /jobs/[slug] detail page for an Artha
-- job — we only ever see it as one item in a paginated list response.
-- Rows are written opportunistically (fire-and-forget) whenever a job
-- passes through getJobsPage(), and read back by app/jobs/[slug]/page.tsx.
-- NOTE: this table already exists live in Supabase — this block just keeps
-- schema.sql in sync as documentation/reference for a fresh setup.
create table if not exists cached_jobs (
  slug text primary key,
  title text not null,
  company text not null,
  logo text,
  description text not null,
  location text,
  city text,
  state text,
  country text,
  job_type text,
  salary_min numeric,
  salary_max numeric,
  salary_curr text,
  exp_min numeric,
  exp_max numeric,
  exp_unit text,
  skills text[] default '{}',
  apply_url text not null,
  posted_date timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists idx_own_jobs_active on own_jobs (is_active, posted_date desc);
create index if not exists idx_subscribers_email on subscribers (email);
create index if not exists idx_cached_jobs_last_seen on cached_jobs (last_seen_at desc);
