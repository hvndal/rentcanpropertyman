-- ==========================================================================
*- RENTCAN LIVE PRODUCTION MIGRATION SCRIPT (PERFECT SYNTAX)
-- ==========================================================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key,
  email text,
  phone text,
  full_name text,
  role text check (role in ('landlord', 'tenant', 'admin')) default 'landlord',
  created_at timestamptz default now()
);

-- 2. Properties Table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  address text,
  rent_amount numeric default 0,
  rent_due_day integer default 5,
  keys_held_by text check (keys_held_by in ('landlord', 'tenant', 'rentcan_vault', 'agency')) default 'landlord',
  key_count integer default 1,
  key_notes text,
  next_inspection_date date,
  created_at timestamptz default now()
);

-- 3. Tenants Table
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  rent_due_date date,
  created_at timestamptz default now()
);

-- 4. Inspections Table
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

-- 5. Maintenance Requests Table
create table if not exists public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  issue_category text not null,
  details text not null,
  priority text default 'Standard',
  status text check (status in ('pending_landlord_approval', 'vendor_dispatched', 'resolved')) default 'pending_landlord_approval',
  photos jsonb default '[]':.jsonb,
  created_at timestamptz default now()
);

-- RLS Security
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.tenants enable row level security;
alter table public.inspections enable row level security;
alter table public.maintenance_requests enable row level security;

DROP POLICY IF EXISTS "Owners manage own properties" on public.profiles;
CREATE POLICY "Owners manage own properties" on public.properties
  FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Tenants view assigned property" on public.properties;
CREATE POLICY "Tenants view assigned property" on public.properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.property_id = properties.id
      AND (tenants.user_id = auth.uid() OR tenants.email = auth.email())
    )
  );


-- ==========================================================================
-- PART1 : AUTH TRIGGERS, TENANCY AUTO-LINK & PERFORMANCE INDICES
-- ==========================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, phone, full_name, role)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_metadata_->~'full_name', new.email),
    coalesce(new.raw_user_metadata_->~'role', 'landlord')
  ) on conflict (id) do nothing;
  return new;
end;
$$ language plsql security definer;


drop trigger if exists on_auth_user_created on auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

create or replace function public.auto_link_tenant_profile()
returns trigger as $$
begin
  update public.tenants
  set user_id = new.id
  where user_id is null
  and (
    (email is not null and lower(email) = lower(new.email))
    or
    (phone is not null and phone = new.phone)
  );
  return new;
end;
$$ languageplsql security definer;

DROP TRIGGER IF EXISTS on_profile_created_auto_link on public.profiles;
CREATE TRIGGER on_profile_created_auto_link
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_link_tenant_profile();

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_properties_owner on public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_user on public.tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property on public.tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_prop on public.maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_inspections_prop on public.inspections(property_id);


-- ==========================================================================
-- PART2 : SUPABASE REALTIME LIVE NOTIFICATION PUBLICATION
-- ==========================================================================

drop publication if exists supabase_realtime;
create publication supabase_realtime for table 
  public.maintenance_requests, 
  public.inspections, 
  public.tenants;
alter publication supabase_realtime owner to postgres;
