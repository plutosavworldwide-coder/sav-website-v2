-- ============================================
-- PRODUCTION-GRADE SUBSCRIPTION SYSTEM SCHEMA
-- ============================================

-- ============================================
-- TABLES
-- ============================================

create table if not exists plans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  description text,
  price numeric not null,
  currency text default 'EUR',
  interval_unit text not null, -- 'month', 'year', 'lifetime'
  interval_count integer default 1,
  paypal_plan_id text unique,
  is_active boolean default true
);

create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  -- Subscription Fields
  role text default 'user' check (role in ('user', 'admin')),
  subscription_status text default 'inactive' check (subscription_status in ('active', 'suspended', 'cancelled', 'expired', 'inactive')),
  subscription_type text check (subscription_type in ('standard', 'extended', 'lifetime', 'indicators_only')),
  subscription_start_date timestamp with time zone,
  subscription_end_date timestamp with time zone, -- NULL for lifetime
  -- PayPal Integration
  paypal_subscription_id text,
  paypal_customer_id text
);

create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users on delete set null,
  -- PayPal Fields
  paypal_transaction_id text unique,
  paypal_subscription_id text,
  paypal_payer_email text,
  -- Payment Details
  amount numeric not null,
  currency text default 'EUR',
  status text not null check (status in ('completed', 'pending', 'failed', 'refunded')),
  payment_method text default 'paypal',
  -- Event Context
  event_type text, -- e.g., 'PAYMENT.SALE.COMPLETED', 'BILLING.SUBSCRIPTION.CANCELLED'
  -- Raw Data (for debugging/auditing)
  metadata jsonb
);

-- Access overrides table (for admin to lock/unlock specific weeks per user)
create table if not exists access_overrides (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users on delete cascade not null,
  week_id text not null,
  state text not null check (state in ('open', 'locked')),
  created_by uuid references auth.users on delete set null,
  unique(user_id, week_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table profiles enable row level security;
alter table plans enable row level security;
alter table transactions enable row level security;
alter table access_overrides enable row level security;

-- Access Overrides: Users can view own, admins can manage all
drop policy if exists "Users can view own access overrides" on access_overrides;
create policy "Users can view own access overrides" on access_overrides for select using (auth.uid() = user_id);

drop policy if exists "Admins can manage access overrides" on access_overrides;
create policy "Admins can manage access overrides" on access_overrides for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Plans: Public read, admin write
drop policy if exists "Public plans are viewable by everyone." on plans;
create policy "Public plans are viewable by everyone." on plans for select using (true);

drop policy if exists "Admins can manage plans" on plans;
create policy "Admins can manage plans" on plans for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Profiles: Users manage own, admins manage all
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

drop policy if exists "Service role can manage all profiles" on profiles;
create policy "Service role can manage all profiles" on profiles for all using (
  auth.jwt() ->> 'role' = 'service_role'
);

-- Transactions: Users see own, service role inserts
drop policy if exists "Users can view own transactions" on transactions;
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);

drop policy if exists "Service role can manage transactions" on transactions;
create policy "Service role can manage transactions" on transactions for all using (
  auth.jwt() ->> 'role' = 'service_role'
);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, subscription_status)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user',
    'inactive'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- INDEXES for Performance
-- ============================================

create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_transactions_paypal_sub_id on transactions(paypal_subscription_id);
create index if not exists idx_profiles_subscription_status on profiles(subscription_status);
create index if not exists idx_profiles_paypal_sub_id on profiles(paypal_subscription_id);

-- ============================================
-- MIGRATION: Add columns if they don't exist
-- ============================================

alter table profiles add column if not exists role text default 'user';
alter table profiles add column if not exists subscription_type text;
alter table profiles add column if not exists subscription_start_date timestamp with time zone;
alter table profiles add column if not exists subscription_end_date timestamp with time zone;
alter table profiles add column if not exists paypal_customer_id text;
