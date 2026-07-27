create extension if not exists pgcrypto;

create table if not exists public.coach_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"onboarded":false,"draft":{}}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coach_workspaces enable row level security;

drop policy if exists "own workspace read" on public.coach_workspaces;
drop policy if exists "own workspace insert" on public.coach_workspaces;
drop policy if exists "own workspace update" on public.coach_workspaces;
drop policy if exists "own workspace delete" on public.coach_workspaces;

create policy "own workspace read"
on public.coach_workspaces for select to authenticated
using ((select auth.uid()) = user_id);

create policy "own workspace insert"
on public.coach_workspaces for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "own workspace update"
on public.coach_workspaces for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "own workspace delete"
on public.coach_workspaces for delete to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.coach_workspaces to authenticated;
