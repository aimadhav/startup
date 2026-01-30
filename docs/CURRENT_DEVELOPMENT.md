# Current Development Status

**Last Updated:** Jan 30, 2026
**Phase:** 2 (Database & Basic UI) - IN PROGRESS

## ✅ Accomplishments

1.  **Project Initialization:**
    -   Created Expo SDK 54 project with TypeScript.
    -   Configured `app.json` with package names (`com.cramit.app`) and URI scheme (`cramit://`).
    -   Cleaned up directory structure (`docs/`, `src/`).

2.  **Environment & Secrets:**
    -   Implemented `.env` loading for Supabase credentials.
    -   Verified real-time connection to Supabase in `App.tsx`.

3.  **Database & Logic:**
    -   **WatermelonDB Setup:** Installed and configured JSI/SQLite adapter. Schema defined in `src/db/schema.ts`.
    -   **Models Implemented:** `Deck`, `Card`, and `FsrsLog` models created in `src/db/models/`.
    -   **Database Instance:** Initialized in `src/db/index.ts`.
    -   **Seeding:** Implemented `src/db/seed.ts` to populate initial data. Verified via logs ("Database seeded successfully!").
    -   **FSRS (Spaced Repetition):** Integrated `ts-fsrs` and verified algorithm execution.
    -   **Documentation:** Imported official WatermelonDB docs into `knowledge/` for offline reference.

4.  **User Interface:**
    -   **Home Screen:** Implemented `DeckList.tsx` showing decks and cards with WatermelonDB observables.
    -   **Styling:** Used standard `StyleSheet` objects (NativeWind disabled due to Windows issues).

5.  **Verification:**
    -   "Real Environment Test" screen (`App.tsx`) confirms:
        -   Environment variables loaded.
        -   Supabase auth connection successful.
        -   Database seeding and querying works.

## ⚠️ Current Issues & Technical Debt

### 1. NativeWind (Tailwind CSS) Disabled
**Severity:** High (Styling blocked)
**Context:**
We attempted to use `nativewind` v4 for Tailwind CSS styling. However, the build fails on **Windows 11 with Node.js v22**.

**Error:**
```text
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Error loading Metro config at: .../metro.config.js
Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'
```

**Root Cause:**
The `nativewind/metro` plugin seemingly mishandles absolute paths on Windows when running in an ESM context (or when Node infers ESM), causing the Metro bundler to crash.

**Current Workaround:**
-   **Action:** Removed `withNativeWind` from `metro.config.js` and removed the Babel plugin.
-   **Result:** App builds and runs successfully using standard `StyleSheet` objects.
-   **Future Plan:** Revisit this in Phase 3. Potential fixes:
    -   Downgrade to Node.js v18 (LTS).
    -   Wait for a NativeWind patch.
    -   Switch to `tamagui` or `unistyles` if the bug persists.

## 📋 Next Steps (Phase 3: Study Interface & Sync)
1.  **Flashcard Interaction:**
    -   Implement "Tinder-like" card swiping UI.
    -   Connect swipe actions (Easy, Hard, etc.) to FSRS algorithm.
    -   Handle card flipping and content rendering (images, formulas).
2.  **Syncing:**
    -   Implement WatermelonDB <-> Supabase sync.
3.  **Refinement:**
    -   Polish Home Screen UI.
    -   Add "Mistakes" or "Cram Mode" logic.
