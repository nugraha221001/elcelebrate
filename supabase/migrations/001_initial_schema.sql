-- ═══════════════════════════════════════════════════════════════
-- CelebrateLoop — Database Schema
-- Supabase PostgreSQL with Row Level Security
-- ═══════════════════════════════════════════════════════════════

-- ── Profiles ────────────────────────────────────────────────
-- Automatically created when a user signs up via auth.users trigger.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Cards ───────────────────────────────────────────────────
create table if not exists public.cards (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  slug            text unique not null,
  category        text not null check (category in ('birthday', 'anniversary', 'graduation', 'invitation')),
  recipient_name  text not null,
  sender_name     text not null default '',
  message         text not null default '',
  event_date      date,
  theme_config    jsonb not null default '{}'::jsonb,
  media_urls      text[] default '{}',
  is_published    boolean default true,
  created_at      timestamptz not null default now()
);

alter table public.cards enable row level security;

-- Public can view published cards (for recipient route)
create policy "Public can view published cards"
  on public.cards for select
  using (is_published = true);

-- Authenticated users can view all their own cards (including unpublished)
create policy "Owners can view all own cards"
  on public.cards for select
  using (auth.uid() = user_id);

-- Authenticated users can create cards
create policy "Authenticated users can create cards"
  on public.cards for insert
  with check (auth.uid() = user_id);

-- Only card owners can update their cards
create policy "Owners can update own cards"
  on public.cards for update
  using (auth.uid() = user_id);

-- Only card owners can delete their cards
create policy "Owners can delete own cards"
  on public.cards for delete
  using (auth.uid() = user_id);

-- Index for slug lookups (recipient route)
create index if not exists idx_cards_slug on public.cards(slug);

-- Index for user card listings
create index if not exists idx_cards_user_id on public.cards(user_id);


-- ── Wishes (Guestbook) ─────────────────────────────────────
create table if not exists public.wishes (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.cards(id) on delete cascade,
  sender_name text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

alter table public.wishes enable row level security;

-- Public can view wishes for published cards
create policy "Public can view wishes for published cards"
  on public.wishes for select
  using (
    exists (
      select 1 from public.cards
      where cards.id = wishes.card_id
      and cards.is_published = true
    )
  );

-- Anyone can submit a wish (guestbook is public)
create policy "Anyone can submit wishes"
  on public.wishes for insert
  with check (
    exists (
      select 1 from public.cards
      where cards.id = wishes.card_id
      and cards.is_published = true
    )
  );

-- Card owners can delete wishes on their cards
create policy "Card owners can delete wishes"
  on public.wishes for delete
  using (
    exists (
      select 1 from public.cards
      where cards.id = wishes.card_id
      and cards.user_id = auth.uid()
    )
  );

-- Index for fetching wishes by card
create index if not exists idx_wishes_card_id on public.wishes(card_id);
