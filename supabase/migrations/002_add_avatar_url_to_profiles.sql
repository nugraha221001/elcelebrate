-- ═══════════════════════════════════════════════════════════════
-- ElCelebrate — Migration: Add avatar_url to profiles
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles
add column if not exists avatar_url text;

-- Update handle_new_user trigger function to include avatar_url from metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$ language plpgsql security definer;
