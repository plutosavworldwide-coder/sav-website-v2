-- Create the access_overrides table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pbxrtqurwdfoplhbzyhd/sql/new

create table if not exists access_overrides (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default now(),
    user_id uuid references auth.users on delete cascade not null,
    week_id text not null,
    state text not null check (state in ('open', 'locked')),
    created_by uuid references auth.users on delete set null,
    unique(user_id, week_id)
);

-- Enable RLS
alter table access_overrides enable row level security;

-- RLS Policies
drop policy if exists "Users can view own access overrides" on access_overrides;
create policy "Users can view own access overrides" on access_overrides for select using (auth.uid() = user_id);

drop policy if exists "Admins can manage access overrides" on access_overrides;
create policy "Admins can manage access overrides" on access_overrides for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Create index for performance
create index if not exists idx_access_overrides_user_id on access_overrides(user_id);
