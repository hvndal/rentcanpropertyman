-- ═════════════════════════════════════════════════════════════════════
-- RENTCAN MASTER DATABASE SCHEMA & MIGRATIONS
-- Execute this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pomxnutomfzmignmyjbi/sql
-- ═════════════════════════════════════════════════════════════════════

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  full_name text,
  avatar_url text,
  phone_number text,
  role text check (role in ('landlord', 'tenant')) default 'landlord',
  onboarding_completed boolean default true
);

-- Ensure all columns exist if table was previously created
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists role text check (role in ('landlord', 'tenant')) default 'landlord';
alter table public.profiles add column if not exists onboarding_completed boolean default true;
alter table public.profiles add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

alter table public.profiles enable row level security;

drop policy if exists "Public profiles viewable by all." on public.profiles;
create policy "Public profiles viewable by all." on public.profiles for select using (true);

drop policy if exists "Users can insert own profile." on public.profiles;
create policy "Users can insert own profile." on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Auto-create profile trigger on auth signup
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. PROPERTIES TABLE
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  address text,
  plan text check (plan in ('residential', 'commercial')) default 'residential',
  rent_amount numeric default 0,
  beds integer default 1,
  baths integer default 1,
  sqft integer default 500,
  status text check (status in ('occupied', 'vacant')) default 'vacant'
);

alter table public.properties add column if not exists plan text default 'residential';
alter table public.properties add column if not exists rent_amount numeric default 0;
alter table public.properties add column if not exists status text default 'vacant';

alter table public.properties enable row level security;

drop policy if exists "Owners manage their properties" on public.properties;
create policy "Owners manage their properties" on public.properties for all using (auth.uid() = owner_id);


-- 3. TENANTS TABLE
create table if not exists public.tenants (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  name text,
  email text,
  phone text,
  rent_due_date integer check (rent_due_date >= 1 and rent_due_date <= 31) default 1,
  rent_amount numeric default 0
);

alter table public.tenants add column if not exists name text;
alter table public.tenants add column if not exists phone text;

alter table public.tenants enable row level security;

drop policy if exists "Owners manage tenants" on public.tenants;
create policy "Owners manage tenants" on public.tenants for all using (
  exists (
    select 1 from public.properties
    where properties.id = tenants.property_id and properties.owner_id = auth.uid()
  )
);

drop policy if exists "Tenants view own record" on public.tenants;
create policy "Tenants view own record" on public.tenants for select using (auth.uid() = user_id);

drop policy if exists "Tenants view assigned property" on public.properties;
create policy "Tenants view assigned property" on public.properties for select using (
  exists (
    select 1 from public.tenants
    where tenants.property_id = properties.id and tenants.user_id = auth.uid()
  )
);


-- 4. PAYMENTS TABLE
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete cascade,
  amount numeric not null,
  status text check (status in ('paid', 'pending', 'overdue')) default 'pending',
  due_date date,
  paid_at timestamp with time zone
);

alter table public.payments enable row level security;

drop policy if exists "Owners manage payments" on public.payments;
create policy "Owners manage payments" on public.payments for all using (
  exists (
    select 1 from public.properties
    where properties.id = payments.property_id and properties.owner_id = auth.uid()
  )
);

drop policy if exists "Tenants view own payments" on public.payments;
create policy "Tenants view own payments" on public.payments for select using (
  exists (
    select 1 from public.tenants
    where tenants.id = payments.tenant_id and tenants.user_id = auth.uid()
  )
);


-- 5. MAINTENANCE REQUESTS & INSPECTIONS TABLE
create table if not exists public.maintenance_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete cascade,
  title text not null,
  description text,
  category text check (category in ('plumbing', 'electrical', 'appliance', 'structural', 'inspection', 'sos')) default 'plumbing',
  status text check (status in ('pending', 'in_progress', 'resolved')) default 'pending',
  priority text check (priority in ('low', 'medium', 'high', 'sos')) default 'medium',
  scheduled_date date
);

alter table public.maintenance_requests add column if not exists scheduled_date date;

alter table public.maintenance_requests enable row level security;

drop policy if exists "Owners manage maintenance" on public.maintenance_requests;
create policy "Owners manage maintenance" on public.maintenance_requests for all using (
  exists (
    select 1 from public.properties
    where properties.id = maintenance_requests.property_id and properties.owner_id = auth.uid()
  )
);

drop policy if exists "Tenants manage maintenance" on public.maintenance_requests;
create policy "Tenants manage maintenance" on public.maintenance_requests for all using (
  exists (
    select 1 from public.tenants
    where tenants.id = maintenance_requests.tenant_id and tenants.user_id = auth.uid()
  )
);


-- 6. DOCUMENTS VAULT TABLE
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references public.properties(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete cascade,
  name text not null,
  type text check (type in ('lease', 'inspection', 'utility', 'id_proof', 'other')) default 'other',
  file_url text not null
);

alter table public.documents enable row level security;

drop policy if exists "Users view own uploaded documents" on public.documents;
create policy "Users view own uploaded documents" on public.documents for select using (auth.uid() = uploaded_by);

drop policy if exists "Users insert own documents" on public.documents;
create policy "Users insert own documents" on public.documents for insert with check (auth.uid() = uploaded_by);


-- 7. STORAGE BUCKETS & POLICIES
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documents-vault', 'documents-vault', false)
on conflict (id) do nothing;

drop policy if exists "Public view property photos" on storage.objects;
create policy "Public view property photos" on storage.objects for select using (bucket_id = 'property-photos');

drop policy if exists "Authenticated upload property photos" on storage.objects;
create policy "Authenticated upload property photos" on storage.objects for insert with check (bucket_id = 'property-photos' and auth.role() = 'authenticated');

drop policy if exists "Authenticated upload documents" on storage.objects;
create policy "Authenticated upload documents" on storage.objects for insert with check (bucket_id = 'documents-vault' and auth.role() = 'authenticated');
