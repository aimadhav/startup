# Project Cramit: MVP Specification

## Overview
A high-performance flashcard app for competitive exams using the FSRS (Free Spaced Repetition Scheduler) algorithm. 
- Local-first with WatermelonDB for high speed.
- Gated by referral codes.
- Supports complex Math/Chem via WebView.

## Tech Stack
- Frontend: React Native (Expo), NativeWind (Tailwind).
- Local DB: WatermelonDB (Primary source of truth).
- Cloud: Supabase (Auth, Storage, and Sync).
- Logic: ts-fsrs library.
- Rendering: WebView (for KaTeX/LaTeX & Chemical formulas).
expo native on eas
## Session & Algorithm Logic
- Priority Queue: 
    1. Rating 1 (Again) cards.
    2. Overdue Review cards.
    3. Super Card Siblings (Contextual cards).
    4. New Cards (Drip-fed: ~10 per session).
- FSRS Retention Goals:
    - Hard Tag: 90% (Higher retention = more frequent shows).
    - Medium Tag: 85%.
    - Easy Tag: 75%.
    - Fundamental: 50%.
- Congo Screen: 
    - If backlog > 0: "Keep Going" CTA.
    - If backlog = 0: "Learn New" or "Take a Break" CTA.

## Super Card Logic (Sequential Flow)
- Set of related cards (e.g., Problem -> Logic -> Pseudo-code -> Code).
- Sequential Locking: If a child card is failed, the entire set is prioritized for review to fix foundational gaps.
- UI: Displays parent cards as "Reference Headers" when a child card is active.

## Image & Asset Logic
- Storage: Supabase Storage.
- Fetching: On adding a deck, assets are downloaded to `expo-file-system`.
- Rendering: Injected into WebView via `file:///` URIs. 
- Zoom: Pinch-to-zoom enabled for detailed chemical/math diagrams.

## Library & Cram Mode
- Referral Teaser: Users browse the Library; "Start Session" is locked until referral code entry.
- Filter Builder: Advanced AND/OR logic for tags (e.g., "Organic" + "PYQ").
- Mistakes Filter: Quick access to cards with `last_rating < 3`.