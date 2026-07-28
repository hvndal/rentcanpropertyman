-- ═════════════════════════════════════════════════════════════════════
-- RENTCAN — Inspections table (run in Supabase SQL Editor)
-- Safe to re-run. Depends on public.properties + public.profiles.
-- ═════════════════════════════════════════════════════════════════════

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  property_id uuid not null references public.properties(id) on delete cascade,
  inspection_date date not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_progress', 'published', 'pass', 'minor_issue', 'urgent')),
  outcome text check (outcome in ('pass', 'minor_issue', 'urgent')),
  notes text,
  checklist jsonb not null default '[]'::jsonb,
  photo_urls jsonb not null default '[]'::jsonb,
  summary text,
  inspected_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz
);

alter table public.inspections add column if not exists updated_at timestamptz default timezone('utc'::text, now());
alter table public.inspections add column if not exists outcome text;
alter table public.inspections add column if not exists checklist jsonb default '[]'::jsonb;
alter table public.inspections add column if not exists photo_urls jsonb default '[]'::jsonb;
alter table public.inspections add column if not exists summary text;
alter table public.inspections add column if not exists published_at timestamptz;

create index if not exists idx_inspections_property on public.inspections(property_id);
create index if not exists idx_inspections_date on public.inspections(inspection_date desc);

alter table public.inspections enable row level security;

drop policy if exists "Owners view inspections" on public.inspections;
create policy "Owners view inspections" on public.inspections
  for select to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = inspections.property_id and p.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Owners manage inspections" on public.inspections;
create policy "Owners manage inspections" on public.inspections
  for all to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = inspections.property_id and p.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = inspections.property_id and p.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Tenants view property inspections" on public.inspections;
create policy "Tenants view property inspections" on public.inspections
  for select to authenticated
  using (
    exists (
      select 1 from public.tenants t
      where t.property_id = inspections.property_id and t.user_id = (select auth.uid())
    )
  );

-- Optional: allow admin role in profiles to manage all inspections
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('landlord', 'tenant', 'admin'));

grant select, insert, update, delete on public.inspections to authenticated;
grant all on public.inspections to service_role;
