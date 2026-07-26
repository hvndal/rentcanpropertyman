-- RENTCAN MIGRATION SCRIPT: KEY HOLDING, INSPECTION DATES & PHOTOS
alter table public.properties add column if not exists keys_held_by text check (keys_held_by in ('landlord', 'tenant', 'rentcan_vault', 'agency')) default 'landlord';
alter table public.properties add column if not exists key_count integer default 1;
alter table public.properties add column if not exists key_notes text;
alter table public.properties add column if not exists next_inspection_date date;

alter table public.maintenance_requests add column if not exists photos jsonb default '[]'::jsonb;
alter table public.maintenance_requests add column if not exists inspected_by uuid references public.profiles(id);

alter table public.tenants add column if not exists user_id uuid references public.profiles(id) on delete set null;

drop policy if exists  Tenants view assigned property on public.properties;
create policy Tenants view assigned property on public.properties for select using (
  exists (
    select 1 from public.tenants
    where tenants.property_id = properties.id and tenants.user_id = auth.uid()
  )
);