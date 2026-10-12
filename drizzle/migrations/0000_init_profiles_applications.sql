create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  job_title text not null,
  company text not null,
  job_url text,
  location text,
  salary text,
  status text not null default 'saved',
  notes text,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;
create policy "Users manage own applications" on public.applications for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid not null,
  round text,
  scheduled_at timestamptz not null,
  location text,
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.interviews to authenticated;
grant all on public.interviews to service_role;
alter table public.interviews enable row level security;
create policy "Users manage own interviews" on public.interviews for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.application_activity (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid not null,
  event text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.application_activity to authenticated;
grant all on public.application_activity to service_role;
alter table public.application_activity enable row level security;
create policy "Users read own activity" on public.application_activity for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own activity" on public.application_activity for insert to authenticated with check (auth.uid() = user_id);