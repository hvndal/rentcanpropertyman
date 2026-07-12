-- ==========================================
-- RENTCAN SUPABASE SCHEMA
-- ==========================================

-- 1. Profiles (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    name text,
    role text check (role in ('landlord', 'tenant')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Properties
CREATE TABLE IF NOT EXISTS public.properties (
    id uuid default gen_random_uuid() primary key,
    landlord_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    address text not null,
    bedrooms integer default 0,
    bathrooms integer default 0,
    sqft integer default 0,
    monthly_rent numeric default 0,
    invite_code text unique,
    plan_type text default 'basic',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Landlords can manage their own properties" ON public.properties FOR ALL USING (auth.uid() = landlord_id);
-- Tenants can view properties if they are assigned to them (checked via tenant_assignments) or via invite code
CREATE POLICY "Anyone can view property by invite code" ON public.properties FOR SELECT USING (true);

-- 3. Tenant Assignments
CREATE TABLE IF NOT EXISTS public.tenant_assignments (
    id uuid default gen_random_uuid() primary key,
    property_id uuid references public.properties(id) on delete cascade not null,
    tenant_id uuid references public.profiles(id) on delete cascade not null,
    status text default 'active' check (status in ('active', 'past')),
    lease_start date,
    lease_end date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(property_id, tenant_id)
);

ALTER TABLE public.tenant_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Landlords can manage assignments for their properties" ON public.tenant_assignments FOR ALL 
    USING (auth.uid() IN (SELECT landlord_id FROM public.properties WHERE id = property_id));
CREATE POLICY "Tenants can view their own assignments" ON public.tenant_assignments FOR SELECT 
    USING (auth.uid() = tenant_id);
CREATE POLICY "Tenants can join property" ON public.tenant_assignments FOR INSERT 
    WITH CHECK (auth.uid() = tenant_id);

-- 4. Maintenance Requests
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id uuid default gen_random_uuid() primary key,
    property_id uuid references public.properties(id) on delete cascade not null,
    tenant_id uuid references public.profiles(id) on delete cascade not null,
    issue_type text not null,
    description text,
    status text default 'pending' check (status in ('pending', 'approved', 'resolved', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants can manage their own requests" ON public.maintenance_requests FOR ALL 
    USING (auth.uid() = tenant_id);
CREATE POLICY "Landlords can manage requests for their properties" ON public.maintenance_requests FOR ALL 
    USING (auth.uid() IN (SELECT landlord_id FROM public.properties WHERE id = property_id));

-- 5. Rent Payments (Ledger)
CREATE TABLE IF NOT EXISTS public.rent_payments (
    id uuid default gen_random_uuid() primary key,
    property_id uuid references public.properties(id) on delete cascade not null,
    tenant_id uuid references public.profiles(id) on delete cascade not null,
    amount numeric not null,
    status text default 'pending' check (status in ('pending', 'paid', 'overdue')),
    due_date date not null,
    paid_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants can view their payments" ON public.rent_payments FOR SELECT 
    USING (auth.uid() = tenant_id);
CREATE POLICY "Landlords can manage payments for their properties" ON public.rent_payments FOR ALL 
    USING (auth.uid() IN (SELECT landlord_id FROM public.properties WHERE id = property_id));

-- 6. Documents (Reports Vault)
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid default gen_random_uuid() primary key,
    property_id uuid references public.properties(id) on delete cascade not null,
    uploader_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    file_url text not null,
    document_type text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Landlords can manage documents for their properties" ON public.documents FOR ALL 
    USING (auth.uid() IN (SELECT landlord_id FROM public.properties WHERE id = property_id));
CREATE POLICY "Tenants can view documents for their property" ON public.documents FOR SELECT 
    USING (auth.uid() IN (SELECT tenant_id FROM public.tenant_assignments WHERE property_id = documents.property_id));

-- Set up realtime
alter publication supabase_realtime add table public.maintenance_requests;
alter publication supabase_realtime add table public.rent_payments;
