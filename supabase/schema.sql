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

create index if not exists idx_own_jobs_active on own_jobs (is_active, posted_date desc);
create index if not exists idx_subscribers_email on subscribers (email);
