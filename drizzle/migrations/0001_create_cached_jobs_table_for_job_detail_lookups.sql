-- Cache of job-feed listings so single-job detail pages can be served
-- (the job feed API has no single-job endpoint). Written by the app's
-- server functions with the privileged client; never exposed to browsers.
CREATE TABLE public.cached_jobs (
  slug text PRIMARY KEY,
  title text NOT NULL,
  company text NOT NULL,
  logo text,
  description text NOT NULL DEFAULT '',
  location text,
  city text,
  state text,
  country text,
  job_type text,
  salary_min numeric,
  salary_max numeric,
  salary_curr text,
  exp_min integer,
  exp_max integer,
  exp_unit text,
  skills text[] NOT NULL DEFAULT '{}',
  apply_url text NOT NULL,
  posted_date timestamptz,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.cached_jobs TO service_role;

ALTER TABLE public.cached_jobs ENABLE ROW LEVEL SECURITY;