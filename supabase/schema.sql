-- 1. Create plans table if it doesn't exist
create table if not exists plans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  description text,
  price numeric not null,
  interval_unit text not null,
  interval_count integer default 1,
  paypal_plan_id text
);

-- 2. Create profiles table if it doesn't exist
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text
);

-- 3. Safely add PayPal columns to profiles
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'paypal_subscription_id') then
    alter table profiles add column paypal_subscription_id text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'subscription_status') then
    alter table profiles add column subscription_status text check (subscription_status in ('active', 'suspended', 'cancelled', 'expired'));
  end if;
end $$;

-- 4. Enable RLS
alter table profiles enable row level security;
alter table plans enable row level security;

-- 5. POLICIES
drop policy if exists "Public plans are viewable by everyone." on plans;
create policy "Public plans are viewable by everyone." on plans for select using ( true );

-- NEW: Allow anyone to insert plans (Required for automation script)
drop policy if exists "Anyone can insert plans" on plans;
create policy "Anyone can insert plans" on plans for insert with check ( true );

drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- 6. Trigger
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