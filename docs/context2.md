# Project Cramit: MVP Specification

## 1. Project Overview
Cramit is a high-performance flashcard application designed for students preparing for competitive exams. It prioritizes efficiency through the FSRS (Free Spaced Repetition Scheduler) algorithm and focuses on high-quality, pre-made decks with future support for user-generated content.

## 2. Technical Stack
- **Frontend:** React Native (Expo)
- **Styling:** NativeWind (Tailwind CSS)
- **Local Database:** WatermelonDB (Source of Truth for persistence)
- **Cloud Backend:** Supabase (Auth, Storage, and Data Sync)
- **State Management:** - **WatermelonDB:** All relational data (Cards, Decks, Logs).
    - **Zustand:** Ephemeral UI state (Modals, current session filters, sync status).
- **Logic:** `ts-fsrs` library for interval calculations.
- **Rendering:** `react-native-webview` (Specifically for LaTeX, KaTeX, and Chemical Formulas).

## 3. Core Data Models
- **Decks:** Title, Subject, Category, Metadata.
- **Cards:** - Content (JSON): Support for multi-element layouts (Text, LaTeX, Images).
    - Tags: `formula`, `exception`, `pyq`, `difficulty_modifier`.
    - `parent_id`: Links cards belonging to a "Super Card" set.
- **FSRS Record:** state, stability, difficulty, elapsed_days, scheduled_days (1:1 with Card).
- **Sync Log:** Tracks deletions and timestamps for delta-syncing.

## 4. Spaced Repetition & Session Logic (The Global Queue)
- **FSRS Customization:** Retention goals are hard-coded based on card difficulty tags:
    - Hard: 90% Retention (More frequent reviews)
    - Medium: 85% Retention
    - Easy: 75% Retention
    - Fundamental: 50% Retention
- **Session Structure:** 30–40 cards per batch.
- **The "Double Down" Logic:** - If daily backlog > 0 at session end, prompt to "Keep Going."
    - If backlog is 0 but new cards are available, prompt to "Learn New."
    - Else, show completion break screen.
- **Priority Queue Order:**
    1. "Again" (Rating 1) cards due now.
    2. Overdue Review cards.
    3. Super Card Siblings (Contextual cards).
    4. New Cards (Drip-fed: ~10 per session).

## 5. Super Card Logic (Sequential Flow)
- **Definition:** A set of related cards (e.g., DSA: Brute Force -> Optimal -> Code).
- **Sequential Locking:** If a "Child" card (e.g., Code) is marked "Again/Hard," its "Parent" cards (e.g., Logic/Brute Force) are prioritized for review in the next session to reinforce the foundation.
- **UI Handling:** When a sub-card is active, parent cards are displayed as "Reference Headers" within the swipe interface to provide context.

## 6. Library & Cram Mode
- **Teaser Access:** Users can browse the Library and deck titles before entering a referral code, but sessions remain locked.
- **Cram Mode Logic:** Operates independently of the Global Queue (FSRS data is not modified).
- **Filter Builder:** Supports complex AND/OR logic (e.g., "Organic Chemistry" AND "Exceptions").
- **Mistakes Feature:** A one-tap filter to revise only cards with a `last_rating < 3`.

## 7. Infrastructure & Sync
- **Sync Strategy:** Option A (Silent/Background). WatermelonDB is the primary source; Supabase syncs in the background upon app start and session completion.
- **Image Handling (Offline First):**
    - Images are stored in Supabase Storage.
    - **Pre-fetching Engine:** When a deck is added, `expo-file-system` downloads assets to the local device.
    - **Rendering:** WebView injected with local `file:///` URIs to ensure offline availability and crisp rendering of complex formulas.
- **Referral System:** Entry is gated by a referral code check against a Supabase `referrals` table.

## 8. UI/UX Guidelines
- **Tinder-style UI:** Swipe Left (Again), Swipe Right (Good), Tap to Flip.
- **Overflow Support:** Cards default to `overflow: hidden`. A toggle allows cards with long content to become scrollable.
- **Visual Distinction:** Super Cards use a specific border color to distinguish them from standard independent cards.