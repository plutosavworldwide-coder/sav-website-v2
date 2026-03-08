import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://pbxrtqurwdfoplhbzyhd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'
);

console.log('🔧 Creating access_overrides table...');
console.log('');

const sql = `
-- Create the access_overrides table
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
`;

const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
    // If exec_sql doesn't exist, try direct approach
    console.log('Using direct SQL execution via REST...');

    // We'll use the database URL directly
    const response = await fetch('https://pbxrtqurwdfoplhbzyhd.supabase.co/rest/v1/rpc/exec_sql', {
        method: 'POST',
        headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql_query: sql })
    });
    return { data: null, error: await response.json() };
});

if (error) {
    console.log('Direct RPC not available. Please run the following SQL in the Supabase SQL Editor:');
    console.log('');
    console.log('='.repeat(70));
    console.log(sql);
    console.log('='.repeat(70));
    console.log('');
    console.log('Go to: https://supabase.com/dashboard/project/pbxrtqurwdfoplhbzyhd/sql/new');
} else {
    console.log('✅ Table created successfully!');
}
