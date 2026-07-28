-- RentCan service orders (Razorpay plan / SOS payments)
-- Run in Supabase SQL editor after deploy.

create table if not exists public.service_orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id text not null,
  plan_name text,
  amount_paise integer not null,
  currency text default 'INR',
  status text check (status in ('created', 'paid', 'failed', 'refunded')) default 'created',
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  paid_at timestamp with time zone,
  notes jsonb default '{}'::jsonb
);

create index if not exists service_orders_user_id_idx on public.service_orders (user_id);
create index if not exists service_orders_razorpay_order_id_idx on public.service_orders (razorpay_order_id);

alter table public.service_orders enable row level security;

drop policy if exists "Users view own service orders" on public.service_orders;
create policy "Users view own service orders" on public.service_orders
  for select to authenticated
  using ( (select auth.uid()) = user_id );

-- Inserts/updates go through service role on the server after payment verify.
grant select on public.service_orders to authenticated;
grant all on public.service_orders to service_role;
