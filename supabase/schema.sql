create table if not exists public.lead_qualifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  company text not null,
  website text not null,
  service text not null,
  budget text not null,
  goal text not null,

  qualification text not null check (qualification in ('High', 'Medium', 'Low')),
  score integer not null check (score between 0 and 100),
  reasoning text not null,
  missing_information jsonb not null default '[]'::jsonb,
  next_best_action text not null,
  model text not null
);

create index if not exists lead_qualifications_created_at_idx
  on public.lead_qualifications (created_at desc);

create index if not exists lead_qualifications_qualification_idx
  on public.lead_qualifications (qualification);

-- The browser never talks directly to this table in this focused assessment.
-- Writes happen server-side using SUPABASE_SERVICE_ROLE_KEY.
-- Keep the service role key server-only.
alter table public.lead_qualifications enable row level security;

-- No public/anon policies are created intentionally.
-- This prevents unauthenticated browser access to stored lead information.
