-- RentCan Database Schema
-- Run this in your Supabase SQL Editor to configure all tables, RLS policies, and storage.

-- 1. Create profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  phone_number text,
  role text check (role in ('landlord', 'tenant')) default 'landlord',
  onboarding_completed boolean default true
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Trigger to automatically create a profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Create properties table
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  address text,
  plan text check (plan in ('residential', 'commercial')) default 'residential',
  rent_amount numeric,
  beds integer,
  baths integer,
  sqft integer,
  status text check (status in ('occupied', 'vacant')) default 'vacant'
);

-- Enable RLS on properties
alter table public.properties enable row level security;

-- Policies for properties
create policy "Owners can do everything on their properties" on public.properties
  for all using (auth.uid() = owner_id);


-- 3. Create tenants table
create table if not exists public.tenants (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  email text,
  phone text,
  rent_due_date integer check (rent_due_date >= 1 and rent_due_date <= 31),
  rent_amount numeric
);

-- Enable RLS on tenants
alter table public.tenants enable row level security;

-- Policies for tenants
create policy "Owners can manage tenants for their properties" on public.tenants
  for all using (
    exists (
      select 1 from public.properties
      where properties.id = tenants.property_id and properties.owner_id = auth.uid()
    )
  );

create policy "Tenants can view their own tenant record" on public.tenants
  for select using (auth.uid() = user_id);

-- Add Tenant View Policy on Properties
create policy "Tenants can view properties they are assigned to" on public.properties
  for select using (
    exists (
      select 1 from public.tenants
      where tenants.property_id = properties.id and tenants.user_id = auth.uid()
    )
  );


-- 4. Create payments table
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  amount numeric not null,
  status text check (status in ('paid', 'pending', 'overdue')) default 'pending',
  due_date date,
  paid_at timestamp with time zone
);

-- Enable RLS on payments
alter table public.payments enable row level security;

-- Policies for payments
create policy "Owners can manage payments for their properties" on public.payments
  for all using (
    exists (
      select 1 from public.properties
      where properties.id = payments.property_id and properties.owner_id = auth.uid()
    )
  );

create policy "Tenants can view their own payments" on public.payments
  for select using (
    exists (
      select 1 from public.tenants
      where tenants.id = payments.tenant_id and tenants.user_id = auth.uid()
    )
  );


-- 5. Create maintenance_requests table
create table if not exists public.maintenance_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete cascade,
  title text not null,
  description text,
  category text check (category in ('plumbing', 'electrical', 'appliance', 'structural')) not null,
  status text check (status in ('pending', 'in_progress', 'resolved')) default 'pending',
  priority text check (priority in ('low', 'medium', 'high')) default 'medium'
);

-- Enable RLS on maintenance requests
alter table public.maintenance_requests enable row level security;

-- Policies for maintenance requests
create policy "Owners can manage maintenance for their properties" on public.maintenance_requests
  for all using (
    exists (
      select 1 from public.properties
      where properties.id = maintenance_requests.property_id and properties.owner_id = auth.uid()
    )
  );

create policy "Tenants can manage maintenance for their rented properties" on public.maintenance_requests
  for all using (
    exists (
      select 1 from public.tenants
      where tenants.id = maintenance_requests.tenant_id and tenants.user_id = auth.uid()
    )
  );


-- 6. Setup Storage Buckets
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can view property photos" on storage.objects
  for select using (bucket_id = 'property-photos');

create policy "Authenticated users can upload property photos" on storage.objects
  for insert with check (bucket_id = 'property-photos' and auth.role() = 'authenticated');
