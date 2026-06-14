-- ===========================================================================
-- Secure Live Event Voting Platform — Supabase schema
-- ===========================================================================
-- Run this entire file once in the Supabase SQL editor for a fresh project.
-- It is idempotent: re-running it drops and recreates tables/functions.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

drop table if exists public.votes cascade;
drop table if exists public.voting_codes cascade;
drop table if exists public.admin_users cascade;
drop table if exists public.teams cascade;

create table public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  created_at  timestamptz not null default now()
);

create table public.voting_codes (
  -- The code itself is the primary key — short, uppercase, attendee-facing.
  code        text primary key,
  is_used     boolean not null default false,
  used_at     timestamptz,
  used_for    uuid references public.teams(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table public.votes (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  -- One vote per code, enforced by the unique constraint below.
  code        text not null unique references public.voting_codes(code) on delete cascade,
  created_at  timestamptz not null default now()
);

create index votes_team_id_idx on public.votes(team_id);
create index voting_codes_is_used_idx on public.voting_codes(is_used);

-- admin_users links a Supabase auth user to admin privileges.
-- Sign a user up via Supabase Auth, then insert their auth.uid here.
create table public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- cast_vote: the security primitive
-- ---------------------------------------------------------------------------
-- Runs as SECURITY DEFINER so the anon role can call it even though it can't
-- write to the underlying tables directly. The function:
--   1. Locks the code row (FOR UPDATE) to prevent concurrent double-spend.
--   2. Rejects if the code is missing or already used.
--   3. Rejects if the team doesn't exist.
--   4. Inserts the vote and marks the code used atomically.
-- Returns the team_id on success; raises an exception otherwise.
-- ---------------------------------------------------------------------------

create or replace function public.cast_vote(
  p_code    text,
  p_team_id uuid
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_row public.voting_codes%rowtype;
  v_team_exists boolean;
begin
  if p_code is null or length(trim(p_code)) = 0 then
    raise exception 'INVALID_CODE' using errcode = 'P0001';
  end if;

  -- Normalize: codes are stored uppercase, trimmed.
  p_code := upper(trim(p_code));

  select * into v_code_row
  from public.voting_codes
  where code = p_code
  for update;

  if not found then
    raise exception 'CODE_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_code_row.is_used then
    raise exception 'CODE_ALREADY_USED' using errcode = 'P0001';
  end if;

  select exists(select 1 from public.teams where id = p_team_id) into v_team_exists;
  if not v_team_exists then
    raise exception 'TEAM_NOT_FOUND' using errcode = 'P0001';
  end if;

  insert into public.votes (team_id, code) values (p_team_id, p_code);

  update public.voting_codes
     set is_used = true,
         used_at = now(),
         used_for = p_team_id
   where code = p_code;

  return p_team_id;
end;
$$;

revoke all on function public.cast_vote(text, uuid) from public;
grant execute on function public.cast_vote(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- validate_code: lightweight pre-check the /vote page uses to gate the UI.
-- Returns true if the code exists and is unused. Does NOT consume the code.
-- ---------------------------------------------------------------------------

create or replace function public.validate_code(p_code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1 from public.voting_codes
    where code = upper(trim(p_code)) and is_used = false
  );
$$;

revoke all on function public.validate_code(text) from public;
grant execute on function public.validate_code(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- results_view: aggregated vote totals, publicly readable for /results.
-- ---------------------------------------------------------------------------

create or replace view public.results_view as
  select
    t.id          as team_id,
    t.name        as team_name,
    t.description as team_description,
    count(v.id)::int as vote_count
  from public.teams t
  left join public.votes v on v.team_id = t.id
  group by t.id, t.name, t.description
  order by vote_count desc, t.name asc;

grant select on public.results_view to anon, authenticated;

-- ---------------------------------------------------------------------------
-- reset_demo_data: clears votes + codes (and optionally teams). Admin-only.
-- ---------------------------------------------------------------------------

create or replace function public.reset_demo_data(p_clear_teams boolean default false)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid()) then
    raise exception 'NOT_AUTHORIZED' using errcode = 'P0001';
  end if;

  delete from public.votes;
  delete from public.voting_codes;
  if p_clear_teams then
    delete from public.teams;
  end if;
end;
$$;

revoke all on function public.reset_demo_data(boolean) from public;
grant execute on function public.reset_demo_data(boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.teams         enable row level security;
alter table public.voting_codes  enable row level security;
alter table public.votes         enable row level security;
alter table public.admin_users   enable row level security;

-- Teams: public read so /vote and /results can list them. Writes go through
-- the service-role key from admin API routes, which bypasses RLS.
create policy "Teams are publicly readable"
  on public.teams for select
  using (true);

-- voting_codes: no public read. Anonymous voters never need to list codes —
-- they call cast_vote/validate_code RPCs which run as SECURITY DEFINER.
-- Admins read via the service-role key from server routes.

-- votes: no public read of individual rows. Aggregated counts come from
-- results_view, which is granted to anon.

-- admin_users: a logged-in user can read their own row to confirm admin
-- status; nothing else.
create policy "Users can read their own admin row"
  on public.admin_users for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Seed data (safe to keep — useful for first-run demo)
-- ---------------------------------------------------------------------------

insert into public.teams (name, description) values
  ('Team Aurora',  'Real-time sign-language translation glove for accessibility.'),
  ('Team Helios',  'Solar-powered low-cost water purifier for remote villages.'),
  ('Team Nimbus',  'Privacy-first peer-to-peer file sync over the local network.'),
  ('Team Quasar',  'AI tutor that builds personalized study plans from class syllabi.');
