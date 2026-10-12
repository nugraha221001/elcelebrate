-- ═══════════════════════════════════════════════════════════════
-- ElCelebrate — Migration: Add phone_number to profiles
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles
add column if not exists phone_number text;
