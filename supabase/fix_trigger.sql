-- Drop the existing trigger first to ensure we replace it cleanly
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Recreate the function with better error handling/defaults
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, subscription_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'user',
    'inactive'
  )
  on conflict (id) do nothing;
  return new;
exception
  when others then
    -- Log error (if you had a logs table) or just return new to allow auth user creation to succeed
    -- preventing the "Database error" from blocking signup
    return new;
end;
$$ language plpgsql security definer;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
