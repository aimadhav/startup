# 🚀 Cramit MVP: The "Crazy Junior" Master Plan

Yo! I've gone through the specs (`context.md`, `context1.md`, etc.). I'm wearing my product hat 🧢 and my engineering hard hat 👷. This plan prioritizes "Student Utility" (getting them studying fast) while acknowledging the technical "Dragons" 🐉 (Sync & Performance).

##  Phase 0: The "Don't Break Stuff" Setup (Environment)
*Target: A running Hello World app with our core libs installed.*

1.  **Init Expo (Managed Workflow):** We want to stay managed as long as possible for ease of updates.
2.  **NativeWind & Tailwind:** Get the styling system working immediately.
3.  **Navigation:** `expo-router` or `react-navigation`? (Assuming standard React Navigation stack for now given the "Stacks" nature of flashcards).
4.  **Supabase Auth:** Basic login/signup screen. *Product note: We need the Referral Code gate here immediately or we can't test the flow.*

## Phase 1: The Brain 🧠 (Data Layer - WatermelonDB)
*Target: Schema defined, DB initializing, and basic "Add Deck" mock function working.*

1.  **Schema Definition:**
    *   `decks`: id, title, subject.
    *   `cards`: id, deck_id, front_content (JSON), back_content (JSON), type (normal/super), parent_id (for Super Cards).
    *   `fsrs_logs`: The spaced repetition history.
2.  **The "Sync" Monster:** Setup the *skeleton* of the sync function. We won't connect it to Supabase fully yet, but the architecture needs to be there.
    *   *Question:* Do we need `Zustand`? **YES.** Watermelon handles the *disk* data. Zustand handles "Is the settings modal open?" or "Which deck filter is active right now?".

## Phase 2: The Heartbeat ❤️ (FSRS & Queue Logic)
*Target: A function that spits out the "Next Card" correctly based on our rules.*

1.  **Algorithm Implementation:** Import `ts-fsrs`.
2.  **Queue Selectors:** Implement the priority queue:
    *   (1) "Again" cards.
    *   (2) Overdue.
    *   (3) Super Card Siblings (The tricky part!).
    *   (4) New Cards (Drip feed).
3.  **Simulation Script:** Write a script to simulate 5 days of studying to ensure the queue doesn't break.

## Phase 3: The Face 🎨 (Card UI & Interaction)
*Target: Tinder-swipe interface working with Dummy Data.*

1.  **Swipe Component:** React Native Reanimated + Gesture Handler. Needs to feel *snappy*.
2.  **The Renderer:**
    *   **Text Cards:** Standard React Native Text (Fast).
    *   **Math/Chem:** `react-native-webview`.
    *   *Product/Eng Tradeoff:* Can we detect if a card *needs* WebView? Loading 40 WebViews in a FlatList is going to kill battery/memory. We need a "Hybrid Renderer".
3.  **Asset Pipeline:** Logic to load images from `file:///` after downloading.

## Phase 4: The Features 🛠️ (Study Modes)
1.  **Global Queue:** The main home screen loop.
2.  **Cram Mode:** The "Panic Button" for exams. Uses the Filter Builder (Tags/Subjects) but *doesn't* update FSRS stability (optional, but safer for the algo).
3.  **Mistakes Filter:** Simple query: `cards.rating < 3`.

## Phase 5: The "Congos" & Polish 🎉
1.  **Session End Screen:** Logic for "Keep Going" vs "Take a Break".
2.  **Onboarding:** The 3-Deck selection screen.
3.  **Teacher Portal Stub:** Just the data fields in Supabase for now.

---

## ❓ The "Wait, how does this work?" List (Resolved Risks)
*As a Product-Eng, I dug into these and here's the verdict:*

1.  **Super Cards UI:** We'll use a "Reference Header" system. The parent card text/image appears sticky at the top while you swipe the children below.
2.  **Sync Conflicts:** WatermelonDB has "Last Write Wins" by default. For the MVP, if a user goes offline-online-offline, we trust the latest timestamp.
3.  **Image "Pre-fetching":** **CONFIRMED DRAGON 🐉.** WatermelonDB only syncs text. We need to build a custom "Sidecar Sync" that runs after the DB sync to fetch images from Supabase Storage into `FileSystem.documentDirectory`.
4.  **Expo Compatibility:** We **MUST** use "Prebuild" (Development Builds). We can't use the standard Expo Go app from the App Store because WatermelonDB needs native JSI code. I'll handle this config.
5.  **Math Input:** I'll build a simple "JSON Injector" script so we can load our premade decks without building a full UI for it yet.

## Next Steps:
**Shall I start Phase 0 (Environment Setup)?**
I'll initialize the Expo project, install NativeWind, and get the barebones running.
