# Current Development Status

**Last Updated:** Jan 31, 2026
**Phase:** 3 (Core Logic & Sync) - ALMOST COMPLETE

## ✅ Accomplishments

1.  **Project Initialization:**
    -   Created Expo SDK 54 project with TypeScript.
    -   Configured `app.json` with package names (`com.cramit.app`) and URI scheme (`cramit://`).

2.  **Database & Logic:**
    -   **WatermelonDB Setup:** Installed and configured JSI/SQLite adapter.
    -   **Schema Upgrade (v3):** Added `User` table and enhanced `Card` table with `assets` and `last_rating`.
    -   **Models:** Updated `Card`, `Deck`, `FsrsLog` and created `User` model.
    -   **Seeding:** Updated `seed.ts` to initialize cards with valid FSRS defaults and fixed IDs for testing.
    -   **Integration Testing:** Refactored `src/db/__tests__/core_logic.test.ts` covering User Management, Assets, and Mistakes Logic.

3.  **Supabase Sync (Offline-First):**
    -   **Schema Replicated:** Created `supabase_schema.sql` mirroring local WatermelonDB structure.
    -   **Sync Service:** Implemented `src/services/sync.ts` with `pull` and `push` logic using WatermelonDB's `synchronize`.
    -   **Timestamp Handling:** Fixed critical bug with BigInt vs ISO String timestamps.
    -   **UI Integration:** Added Sync button to `App.tsx` with loading state and "Reset" confirmation.
    -   **Testing:** Verified Push/Pull manually and via unit tests.

4.  **User Interface:**
    -   **NativeWind v4 Integration:** Successfully configured `nativewind` with `tailwindcss`.
    -   **Refactoring:** Converted `App.tsx` and `DeckList.tsx` to use Tailwind utility classes (`className`).
    -   **Styling:** Implemented a clean, modern UI for the Deck List with expanded states and badges.

## ⚠️ Current Issues & Technical Debt
-   **Sync Scalability:** Sync currently pulls all records (limit 1000). Needs recursive pagination for production scale.
-   **Security:** RLS is disabled in Supabase. User IDs are in the schema but not yet enforced by Auth logic.

## 📋 Next Steps (Phase 3: Sync & Study)
1.  **Flashcard Interaction (Study Mode):**
    -   Implement "Tinder-like" card swiping UI using `react-native-reanimated`.
    -   Connect user ratings (Easy/Hard) to the `fsrs_logs` table.
2.  **Refinement:**
    -   Implement "Mistakes" mode using the now-tested `last_rating` filter.
