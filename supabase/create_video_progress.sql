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
