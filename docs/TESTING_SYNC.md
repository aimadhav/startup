# Sync Testing Guide

## 1. Prerequisites
- Ensure your App is running (`npm start`, then Android/iOS).
- Ensure Supabase Dashboard is open.
- Ensure you have clicked the **"Sync"** button at least once to clear initial errors.

## 2. Testing "Pull" (Cloud -> App)
*Goal: Verify that data created in Supabase appears in the App.*

1.  **Go to Supabase Dashboard** -> **Table Editor** -> **decks**.
2.  Click **Insert** -> **Insert Row**.
3.  Fill in:
    -   `id`: Click the "Generate UUID" or type `test_deck_02`.
    -   `title`: "Remote Physics".
    -   `created_at`: Enter `2000000000000` (A future date to ensure it syncs).
    -   `updated_at`: Enter `2000000000000`.
    -   `deleted`: Select `FALSE`.
    -   (Leave others null/default).
4.  Click **Save**.
5.  **In the App**: Tap the **Sync** button in the header.
6.  **Verify**: The "Remote Physics" deck should instantly appear in the Deck List.

## 3. Testing "Push" (App -> Cloud)
*Goal: Verify that data created locally sends to Supabase.*

1.  **In the App**: Tap the **Reset** button (Red).
    -   *What happens:* This deletes local data and re-seeds it with "General Knowledge" + 3 cards. Importantly, it now uses **FIXED IDs** (`seed_deck_gk`) to prevent duplicates.
2.  **In the App**: Tap the **Sync** button.
    -   Wait for the spinner to stop.
3.  **Go to Supabase Dashboard** -> **Table Editor** -> **cards**.
4.  **Refresh** the table (or page).
5.  **Verify**: You should see new rows for "Paris", "Mitochondria", etc.
    -   *Note:* Since we now use fixed IDs, multiple resets will update the *same* rows instead of creating duplicates.

## 4. Troubleshooting
-   **"Sync Failed" Error**: Check the console logs.
-   **No Data Appears**: Ensure RLS is disabled or your user matches the policy (currently we assume RLS is disabled/open for MVP).

## 5. Cleaning up Duplicates
If you have multiple "General Knowledge" decks from previous resets:

1.  **Go to Supabase Dashboard** -> **Table Editor** -> **decks**.
2.  Select all rows *except* the one with ID `seed_deck_gk` (or the one you want to keep).
3.  Click **Delete** -> **Confirm**.
4.  **In the App**: Tap **Reset** again. This will wipe the local database and re-download only the valid decks from Supabase (or re-seed the fixed one).
