-- Interviews and follow-ups, each tied to one of the user's applications.
-- Additive only; relies on public.applications and public.set_updated_at()
-- from the previous migration. RLS: owner-only, and writes must also reference
-- an application the caller owns.

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  round text,
  interview_type text not null default 'video'
    check (interview_type in ('phone','video','onsite','technical','hr','assessment','other')),
  scheduled_at timestamptz not null,           -- absolute instant (UTC)
  timezone text not null default 'Asia/Kolkata', -- IANA zone it was scheduled in
  meeting_url text,
  prep_notes text,
  status text not null default 'scheduled'
    check (status in ('scheduled','completed','cancelled')),
  completed_at timestamptz,
  outcome text not null default 'pending'
    check (outcome in ('pending','passed','failed')),
  feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interviews_user_sched_idx on public.interviews (user_id, scheduled_at);
create index if not exists interviews_application_idx on public.interviews (application_id);

drop trigger if exists interviews_set_updated_at on public.interviews;
create trigger interviews_set_updated_at before update on public.interviews
  for each row execute function public.set_updated_at();

alter table public.interviews enable row level security;

drop policy if exists "interviews_select_own" on public.interviews;
create policy "interviews_select_own" on public.interviews
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "interviews_insert_own" on public.interviews;
create policy "interviews_insert_own" on public.interviews
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())
  );
drop policy if exists "interviews_update_own" on public.interviews;
create policy "interviews_update_own" on public.interviews
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())
  );
drop policy if exists "interviews_delete_own" on public.interviews;
create policy "interviews_delete_own" on public.interviews
  for delete to authenticated using (user_id = auth.uid());

-- ------------------------------------------------------------------ follow_ups
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  title text not null,
  follow_up_type text not null default 'email'
    check (follow_up_type in ('email','call','linkedin','thank_you','other')),
  due_date date not null,
  notes text,
  status text not null default 'pending' check (status in ('pending','completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'completed') = (completed_at is not null))
);

create index if not exists follow_ups_user_status_due_idx on public.follow_ups (user_id, status, due_date);
create index if not exists follow_ups_application_idx on public.follow_ups (application_id);

drop trigger if exists follow_ups_set_updated_at on public.follow_ups;
create trigger follow_ups_set_updated_at before update on public.follow_ups
  for each row execute function public.set_updated_at();

alter table public.follow_ups enable row level security;

drop policy if exists "follow_ups_select_own" on public.follow_ups;
create policy "follow_ups_select_own" on public.follow_ups
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "follow_ups_insert_own" on public.follow_ups;
create policy "follow_ups_insert_own" on public.follow_ups
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())
  );
drop policy if exists "follow_ups_update_own" on public.follow_ups;
create policy "follow_ups_update_own" on public.follow_ups
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())
  );
drop policy if exists "follow_ups_delete_own" on public.follow_ups;
create policy "follow_ups_delete_own" on public.follow_ups
  for delete to authenticated using (user_id = auth.uid());
