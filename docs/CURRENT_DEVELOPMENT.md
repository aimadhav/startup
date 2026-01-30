# Current Development Status

**Last Updated:** Jan 30, 2026
**Phase:** 1 (Environment Setup & Verification) - COMPLETED

## ✅ Accomplishments

1.  **Project Initialization:**
    -   Created Expo SDK 54 project with TypeScript.
    -   Configured `app.json` with package names (`com.cramit.app`) and URI scheme (`cramit://`).
    -   Cleaned up directory structure (`docs/`, `src/`).

2.  **Environment & Secrets:**
    -   Implemented `.env` loading for Supabase credentials.
    -   Verified real-time connection to Supabase in `App.tsx`.

3.  **Database & Logic:**
    -   **WatermelonDB:** Installed and configured JSI/SQLite adapter. Schema defined in `src/db/schema.ts`.
    -   **FSRS (Spaced Repetition):** Integrated `ts-fsrs` and verified algorithm execution.
    -   **State Management:** Zustand installed (ready for Phase 2).

4.  **Verification:**
    -   "Real Environment Test" screen (`App.tsx`) confirms:
        -   Environment variables loaded.
        -   Supabase auth connection successful.
        -   Standard React Native styling works.

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

## 📋 Next Steps (Phase 2)
1.  Implement WatermelonDB Models (`Deck`, `Card`, `FsrsLog`).
2.  Create the `database` instance with these models.
3.  Build the **Home Screen** (Deck List).
4.  Implement basic Card creation (seeding).
