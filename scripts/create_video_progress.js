import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://pbxrtqurwdfoplhbzyhd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'
);

console.log('🔧 Creating video_progress table...');
console.log('');

const sql = `
-- Video Progress Table
create table if not exists video_progress (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users on delete cascade not null,
  video_id text not null,
  completed_at timestamp with time zone default now(),
  unique(user_id, video_id)
);

-- RLS Logic
alter table video_progress enable row level security;

drop policy if exists "Users can view own video progress" on video_progress;
create policy "Users can view own video progress" on video_progress for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own video progress" on video_progress;
create policy "Users can insert own video progress" on video_progress for insert with check (auth.uid() = user_id);

-- Optional: Index for performance
create index if not exists idx_video_progress_user_id on video_progress(user_id);
create index if not exists idx_video_progress_video_id on video_progress(video_id);
`;

let data, error;

try {
    const response = await supabase.rpc('exec_sql', { sql_query: sql });
    data = response.data;
    error = response.error;
} catch (err) {
    error = err;
}

if (error) {
    console.log('RPC exec_sql failed or missing. Attempting direct REST fallback...');
    try {
        const response = await fetch('https://pbxrtqurwdfoplhbzyhd.supabase.co/rest/v1/rpc/exec_sql', {
            method: 'POST',
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql_query: sql })
        });

        if (!response.ok) {
            const text = await response.text();
            error = { message: text };
        } else {
            error = null;
        }
    } catch (fallbackErr) {
        error = fallbackErr;
    }
}

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
