create extension if not exists pgcrypto;

create table if not exists public.draft_responses (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null unique,
  name text not null,
  availability jsonb not null,
  participation_mode text not null check (participation_mode in ('in-person', 'remote')),
  comments text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.draft_responses enable row level security;

-- No public policies are needed. The website's server routes use the private
-- Supabase service-role key and validate all submissions before writing.
