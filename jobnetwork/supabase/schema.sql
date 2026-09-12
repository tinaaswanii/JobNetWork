-- Jobs you add yourself, shown merged with the artha.link feed.
create table if not exists own_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  logo text,
  description text not null,          -- HTML, same shape as artha.link's PublicJob
  location text,
  city text,
  state text,
  country text,
  job_type text,                      -- full-time | part-time | contract | internship
  work_mode text,                     -- remote | hybrid | onsite
  salary_min numeric,
  salary_max numeric,
  salary_curr text default 'USD',
  skills text[] default '{}',
  apply_url text not null,            -- where "Apply" sends the student for YOUR OWN listings
  posted_date timestamptz not null default now(),
  is_active boolean not null default true
);

-- Email digest subscribers + their saved filters.
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  filters jsonb not null default '{}', -- same shape as JobsQuery in lib/artha.ts
  frequency text not null default 'daily', -- daily | weekly
  last_sent_at timestamptz,
  confirmed boolean not null default false, -- set true after double opt-in click
  created_at timestamptz not null default now()
);

-- Cache of externally scraped reference prices (course/bootcamp/internship stipend etc.)
-- Populate this from app/api/cron/price-scrape/route.ts, not on every page load.
create table if not exists scraped_prices (
  id uuid primary key default gen_random_uuid(),
  source text not null,        -- which site this came from
  label text not null,         -- e.g. "Data Science Bootcamp — avg tuition"
  price numeric,
  currency text default 'USD',
  url text,
  scraped_at timestamptz not null default now()
);

create index if not exists idx_own_jobs_active on own_jobs (is_active, posted_date desc);
create index if not exists idx_subscribers_email on subscribers (email);
