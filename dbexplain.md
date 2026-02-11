
# Database Architecture: End-to-End Explanation

## 1. Overview
The "Cramit" database architecture is designed for an **Offline-First** mobile application that synchronizes with a cloud backend.
-   **Local Database:** WatermelonDB (SQLite) on the device.
-   **Cloud Database:** Supabase (PostgreSQL).
-   **Sync Mechanism:** WatermelonDB's Sync Protocol (Pull/Push Deltas).

## 2. Local Database (WatermelonDB)

### Schema (v5)
The local database consists of five core tables defined in `src/db/schema.ts`.

#### A. `decks`
Stores the metadata for flashcard collections.
*   **Columns:** `title`, `subject`, `category`, `metadata` (JSON), `created_at`, `updated_at`.
*   **Role:** The organizational unit for cards.

#### B. `cards`
The core learning unit.
*   **Columns:**
    *   **Relationships:** `deck_id` (Optional origin), `parent_id` (For Super Card hierarchy).
    *   **Content:** `content` (JSON - Front/Back), `assets` (JSON - Images), `tags` (JSON).
    *   **Type:** `card_type` ('standard', 'super_parent', 'super_child').
    *   **FSRS Data:** `state`, `stability`, `difficulty`, `due`, `last_review`, `last_rating`, `reps`, `lapses`.
    *   **Flags:** `is_bookmarked` (Boolean).
*   **Role:** Stores the flashcard content and its spaced-repetition state.

#### C. `deck_cards` (New in v5)
A join table facilitating a **Many-to-Many** relationship between Decks and Cards.
*   **Columns:** `deck_id`, `card_id`, `created_at`, `updated_at`.
*   **Role:** Allows a single card (e.g., "Photosynthesis") to exist in multiple decks (e.g., "Biology 101" AND "MCAT Prep") without duplication.

#### D. `fsrs_logs`
An immutable history of reviews.
*   **Columns:** `card_id`, `rating` (1-4), `state`, `stability`, `difficulty`, `elapsed_days`, `scheduled_days`, `review` (timestamp).
*   **Role:** Used by the FSRS algorithm (via `ts-fsrs`) to optimize future intervals.

#### E. `users`
Stores user-specific settings and identity.
*   **Columns:** `name`, `referral_code`, `teacher_id`, `settings` (JSON).
*   **Role:** Manages user identity and preferences locally.

## 3. Cloud Database (Supabase)

The cloud schema mirrors the local schema to ensure seamless synchronization. It is defined in `supabase_schema.sql` and maintained via migrations (e.g., `scripts/migrate-m2m.ts`).

*   **Tables:** `decks`, `cards`, `deck_cards`, `fsrs_logs`, `users`.
*   **Data Types:**
    *   Timestamps (`created_at`, `updated_at`) are stored as `BIGINT` (milliseconds) to match WatermelonDB's Javascript/JSI environment, preventing conversion errors.
    *   JSON fields are stored as `JSONB` for efficient querying in Postgres.
*   **Auth Integration:** Tables include a `user_id` column linked to `auth.users` for Row Level Security (RLS), though RLS policies are currently pending implementation.

## 4. Synchronization Flow

### The Protocol
1.  **Pull (Cloud -> Device):**
    *   Device requests changes since `last_pulled_at` timestamp.
    *   Supabase returns records where `updated_at > last_pulled_at`.
    *   WatermelonDB updates local SQLite.

2.  **Push (Device -> Cloud):**
    *   Device sends locally created/updated/deleted records.
    *   Supabase "upserts" these into Postgres.

### Key Logic
*   **Deletes:** Soft deletes are used. Records have a `deleted` boolean column.
*   **Conflict Resolution:** Last-write-wins (usually handled by the server, but current MVP is simple overwrite).

## 5. Environment & Security
*   **.env:** Contains `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for client-side access.
*   **Secrets:** `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are strictly for server-side scripts (migrations) and must **never** be exposed to the client bundle.

## 6. Recent Changes (v5)
*   **Many-to-Many Decks:** Transitioned from strict 1:1 `Card-Deck` to N:M using `deck_cards`.
*   **Bookmarks:** Added native bookmarking support to the `Card` model.
