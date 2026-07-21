-- ═════════════════════════════════════════════════════════════════════
-- RENTCAN DATABASE UPDATE MIGRATION SCRIPT
-- Paste this script into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pomxnutomfzmignmyjbi/sql
-- Safe to run on top of existing tables. Does not drop or delete data.
-- ═════════════════════════════════════════════════════════════════════

-- 1. UPDATE PROFILES TABLE
-- Add missing onboarding columns to profiles table safely
alter table public.profiles add column if not exists onboarding_completed boolean default true;
alter table public.profiles add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Update the handle_new_user function to support onboarding_completed
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, onboarding_completed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url',
    'landlord',
    true
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url);
  return new;
end;
$$ language plpgsql security definer;


-- 2. UPDATE TENANTS TABLE
-- Add missing name and phone columns to tenants
alter table public.tenants add column if not exists name text;
alter table public.tenants add column if not exists phone text;


-- 3. UPDATE MAINTENANCE REQUESTS TABLE (INSPECTIONS & SOS)
-- Add scheduled_date column
alter table public.maintenance_requests add column if not exists scheduled_date date;

-- Update constraints for category and priority if needed (drop old check constraint if it restricts 'inspection' or 'sos')
alter table public.maintenance_requests drop constraint if exists maintenance_requests_category_check;
alter table public.maintenance_requests add constraint maintenance_requests_category_check 
  check (category in ('plumbing', 'electrical', 'appliance', 'structural', 'inspection', 'sos'));

alter table public.maintenance_requests drop constraint if exists maintenance_requests_priority_check;
alter table public.maintenance_requests add constraint maintenance_requests_priority_check 
  check (priority in ('low', 'medium', 'high', 'sos'));


-- 4. CREATE NEW DOCUMENTS TABLE & POLICIES
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references public.properties(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete cascade,
  name text not null,
  type text check (type in ('lease', 'inspection', 'utility', 'id_proof', 'other')) default 'other',
  file_url text not null
);

-- Enable RLS on documents
alter table public.documents enable row level security;

-- Add policies for documents (check if they exist first)
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'documents' and policyname = 'Users view own uploaded documents'
  ) then
    create policy "Users view own uploaded documents" on public.documents for select using (auth.uid() = uploaded_by);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'documents' and policyname = 'Users insert own documents'
  ) then
    create policy "Users insert own documents" on public.documents for insert with check (auth.uid() = uploaded_by);
  end if;
end
$$;


-- 5. STORAGE BUCKETS SETUP
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documents-vault', 'documents-vault', false)
on conflict (id) do nothing;

-- Add Storage upload policy for documents vault
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated upload documents'
  ) then
    create policy "Authenticated upload documents" on storage.objects for insert with check (bucket_id = 'documents-vault' and auth.role() = 'authenticated');
  end if;
end
$$;
