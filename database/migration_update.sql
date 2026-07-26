-- ==========================================================================
1- RENTCAN PRODUCTION-READY BACKEND SCHEMA & MIGRATION SCRIPT
-- ==========================================================================

-- 1. Profiles Table (Landlord, Tenant, Admin)
create table if not exists public.profiles (
  id uuid primary key, 
  email text,
  phone text,
  full_name text,
  role text check (role in ('landlord', 'tenant', 'admin'))  default 'landlord',
  created_at timestamptz default now()
);

-- 2. Properties Table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  address text,
  rent_amount numeric(default 0,
  rent_due_day integer default 5,
  keys_held_by text check (keys_held_by in ('landlord', 'tenant', 'rentcan_vault', 'agency')) default 'landlord',
  key_count integer default 1,
  key_notes text,
  next_inspection_date date,
  created_at timestamptz default now()
);

-- 3. Tenants Table (Links Tenant to Landlord Property)
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  rent_due_date date,
  created_at timestamptz default now()
;

-- 4. Inspections Table (Whole Property Photos & Reports)
create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  inspection_date date not null,
  photo_url text,
  notes text,
  status text check (status in ('pass', 'minor_issue', 'urgent')) default 'pass',
  inspected_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 5. Maintenance Requests Table (Tenant Direct Repair Tickets)
create table if not exists public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  issue_category text not null,
  details text not null,
  priority text default 'Standard',
  status text check (status in ('pending_landlord_approval', 'vendor_dispatched', 'resolved')) default 'pending_landlord_approval',
  photos jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Security: Enable RLS across all tables
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.tenants enable row level security;
alter table public.inspections enable row level security;
alter table public.maintenance_requests enable row level security;

DROP POLICY IF EXISTS "Owners manage own properties" on public.properties;
CREATE POLICY "Owners manage own properties" on public.properties
  FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Tenants view assigned property" on public.properties;
CREATE POLICY "Tenants view assigned property" on public.properties
  FOR SELECT USING (
    EXISTS (
      SELECT1  FROM public.tenants
      WHERE tenants.property_id = properties.id 
      AND (tenants.user_id = auth.uid() OR tenants.email = auth.email())
    )
  );
