-- Email alerts: delivery tracking, one-click unsubscribe, link to auth user,
-- and (IMPORTANT) lock the subscribers table down with RLS.
-- schema.sql created `subscribers` without RLS, which means anyone holding the
-- public anon key could read every subscriber's email. The app only touches this
-- table with the service-role key (which bypasses RLS), so enabling RLS with no
-- policies breaks nothing and closes that hole.

alter table public.subscribers enable row level security;

alter table public.subscribers add column if not exists welcome_sent_at timestamptz;
alter table public.subscribers add column if not exists welcome_error text;
alter table public.subscribers add column if not exists unsubscribe_token uuid not null default gen_random_uuid();
alter table public.subscribers add column if not exists user_id uuid references auth.users(id) on delete set null;

create unique index if not exists subscribers_unsubscribe_token_uniq on public.subscribers (unsubscribe_token);
create index if not exists subscribers_welcome_pending_idx
  on public.subscribers (created_at) where welcome_sent_at is null and confirmed = true;
