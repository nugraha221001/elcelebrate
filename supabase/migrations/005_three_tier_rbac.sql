-- ═══════════════════════════════════════════════════════════════
-- ElCelebrate — Migration 005: 3-Tier RBAC & Immortal Root Owner
-- ═══════════════════════════════════════════════════════════════

-- 1. Update profiles role check to include 'super_admin'
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin', 'super_admin'));

-- 2. Allow authenticated users to insert transactions for their own cards
drop policy if exists "Users can insert own transactions" on public.transactions;
create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

-- 3. Set lesynugraha@gmail.com as immortal super_admin if profile exists
update public.profiles
set role = 'super_admin'
where lower(email) = 'lesynugraha@gmail.com';

