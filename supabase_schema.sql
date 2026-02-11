-- Create a schema for your tables if you want to namespace them, or use public (default)
-- Tables are created in public schema here.

-- 1. DECKS TABLE
create table public.decks (
  id text primary key, -- WatermelonDB uses string IDs
  user_id uuid default auth.uid(), -- Link to Supabase Auth
  title text not null,
  subject text,
  category text,
  metadata jsonb, -- Mapped from JSON string
  created_at bigint, -- Storing as raw timestamp (ms) to match WatermelonDB
  updated_at bigint, -- Critical for Sync
  deleted boolean default false -- For soft deletes in Sync
);

-- 2. CARDS TABLE
create table public.cards (
  id text primary key,
  deck_id text references public.decks(id), -- Optional now (legacy or primary deck)
  user_id uuid default auth.uid(), -- Link to Supabase Auth
  parent_id text, -- For Super Card siblings
  content jsonb not null, -- { front: "...", back: "..." }
  tags jsonb, -- ["tag1", "tag2"]
  assets jsonb, -- { frontImage: "...", backImage: "..." }
  card_type text not null, -- 'standard', 'super_parent', 'super_child'
  
  -- FSRS Fields
  state integer, -- 0-3
  stability double precision,
  difficulty double precision,
  due bigint,
  last_review bigint,
  last_rating integer,
  reps integer,
  lapses integer,
  is_bookmarked boolean default false,
  
  created_at bigint,
  updated_at bigint,
  deleted boolean default false
);

-- Index for performance
create index cards_deck_id_idx on public.cards(deck_id);
create index cards_due_idx on public.cards(due);
create index cards_user_id_idx on public.cards(user_id);
create index decks_user_id_idx on public.decks(user_id);

-- 3. DECK_CARDS (Many-to-Many)
create table public.deck_cards (
  id text primary key, -- WatermelonDB ID
  deck_id text references public.decks(id),
  card_id text references public.cards(id),
  created_at bigint,
  updated_at bigint,
  deleted boolean default false
);

create index deck_cards_deck_id_idx on public.deck_cards(deck_id);
create index deck_cards_card_id_idx on public.deck_cards(card_id);

-- 4. FSRS_LOGS TABLE
-- Note: Added created_at/updated_at to support sync protocol even if missing locally
create table public.fsrs_logs (
  id text primary key,
  card_id text references public.cards(id),
  user_id uuid default auth.uid(), -- Link to Supabase Auth
  rating integer,
  state integer,
  stability double precision,
  difficulty double precision,
  elapsed_days double precision,
  scheduled_days double precision,
  due bigint,
  last_review bigint,
  review bigint, -- The actual log timestamp
  
  created_at bigint,
  updated_at bigint,
  deleted boolean default false
);

create index fsrs_logs_card_id_idx on public.fsrs_logs(card_id);
create index fsrs_logs_user_id_idx on public.fsrs_logs(user_id);

-- 5. USERS TABLE
-- This table usually links to Supabase Auth. 
-- If WatermelonDB generates a random ID, you might need a trigger to link it to auth.uid()
create table public.users (
  id text primary key,
  user_id uuid references auth.users(id),
  name text,
  referral_code text,
  teacher_id text,
  settings jsonb,
  
  created_at bigint,
  updated_at bigint,
  deleted boolean default false
);

-- ENABLE ROW LEVEL SECURITY (RLS)
-- Highly recommended to enable RLS so users only see their own data.
-- You will need to add a 'user_id' column to these tables and set up policies.
-- For example:
-- alter table public.decks add column user_id uuid references auth.users(id);
-- alter table public.cards add column user_id uuid references auth.users(id);
-- create policy "Users can see their own decks" on decks for all using (auth.uid() = user_id);
