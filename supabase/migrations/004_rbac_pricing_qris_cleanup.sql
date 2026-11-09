-- ═══════════════════════════════════════════════════════════════
-- ElCelebrate — Migration 004: RBAC, Duration Pricing, QRIS, Grace Period
-- ═══════════════════════════════════════════════════════════════

-- 1. Profiles Role Column (Multi-Admin RBAC)
alter table public.profiles
add column if not exists role text not null default 'user' check (role in ('user', 'admin'));

-- 2. Cards Duration, Expiration & Payment Columns
alter table public.cards
add column if not exists payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'admin_free', 'expired')),
add column if not exists duration_days integer,
add column if not exists paid_at timestamptz,
add column if not exists expires_at timestamptz,
add column if not exists grace_until timestamptz;

-- Index for expiration cleanup queries
create index if not exists idx_cards_expiration on public.cards(payment_status, expires_at, grace_until);

-- 3. Transactions Table (QRIS Payments & Webhooks)
create table if not exists public.transactions (
  id                uuid primary key default gen_random_uuid(),
  order_id          text unique not null,
  card_id           uuid references public.cards(id) on delete set null,
  user_id           uuid not null references auth.users(id) on delete cascade,
  amount            integer not null,
  duration_days     integer not null,
  status            text not null default 'pending' check (status in ('pending', 'settled', 'expired', 'failed')),
  payment_method    text not null default 'qris',
  qr_string         text,
  gateway_provider  text default 'simulation',
  gateway_reference text,
  created_at        timestamptz not null default now(),
  settled_at        timestamptz
);

alter table public.transactions enable row level security;

-- Users can view their own transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- Admins can view all transactions
create policy "Admins can view all transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Index for order_id lookup in webhooks
create index if not exists idx_transactions_order_id on public.transactions(order_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);

