-- Application tracker tables. Additive only: no drops, no data resets.
-- Does not touch own_jobs / cached_jobs, so public job listing access is unchanged.
--
-- job_id is TEXT with no foreign key on purpose: public jobs come from two
-- sources (cached_jobs.slug = text, own_jobs.id = uuid, exposed as "own_<uuid>"),
-- and cached jobs expire. Company/title/url are denormalised onto each row so
-- history survives when a public job is removed.

create extension if not exists pgcrypto;

-- Shared updated_at trigger function.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- applications
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id text,
  company_name text not null,
  job_title text not null,
  job_url text,
  location text,
  work_mode text check (work_mode in ('remote', 'hybrid', 'onsite')),
  employment_type text,
  applied_at date,
  status text not null default 'interested'
    check (status in ('interested','applied','assessment','interview','offer','rejected','withdrawn')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_status_idx on public.applications (user_id, status);
create index if not exists applications_user_updated_idx on public.applications (user_id, updated_at desc);
-- One tracked application per user per public job (manual rows have null job_id).
create unique index if not exists applications_user_job_uniq
  on public.applications (user_id, job_id) where job_id is not null;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

alter table public.applications enable row level security;

drop policy if exists "applications_select_own" on public.applications;
create policy "applications_select_own" on public.applications
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own" on public.applications
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "applications_update_own" on public.applications;
create policy "applications_update_own" on public.applications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "applications_delete_own" on public.applications;
create policy "applications_delete_own" on public.applications
  for delete to authenticated using (user_id = auth.uid());

-- ------------------------------------------------------------------ saved_jobs
-- The title/company/url/location snapshot columns are additions to the spec so a
-- saved job still renders after the cached public job expires.
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id text not null,
  job_title text,
  company_name text,
  job_url text,
  location text,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index if not exists saved_jobs_user_created_idx on public.saved_jobs (user_id, created_at desc);

alter table public.saved_jobs enable row level security;

drop policy if exists "saved_jobs_select_own" on public.saved_jobs;
create policy "saved_jobs_select_own" on public.saved_jobs
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "saved_jobs_insert_own" on public.saved_jobs;
create policy "saved_jobs_insert_own" on public.saved_jobs
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "saved_jobs_delete_own" on public.saved_jobs;
create policy "saved_jobs_delete_own" on public.saved_jobs
  for delete to authenticated using (user_id = auth.uid());

-- ------------------------------------------------------ application_activities
create table if not exists public.application_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  activity_type text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists application_activities_app_idx
  on public.application_activities (application_id, created_at desc);
create index if not exists application_activities_user_idx
  on public.application_activities (user_id);

alter table public.application_activities enable row level security;

drop policy if exists "activities_select_own" on public.application_activities;
create policy "activities_select_own" on public.application_activities
  for select to authenticated using (user_id = auth.uid());

-- Ownership check: the parent application must also belong to the caller, so a
-- user can't attach activity rows to someone else's application.
drop policy if exists "activities_insert_own" on public.application_activities;
create policy "activities_insert_own" on public.application_activities
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );
drop policy if exists "activities_update_own" on public.application_activities;
create policy "activities_update_own" on public.application_activities
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );
drop policy if exists "activities_delete_own" on public.application_activities;
create policy "activities_delete_own" on public.application_activities
  for delete to authenticated using (user_id = auth.uid());
