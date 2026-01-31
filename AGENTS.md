# Minor Cramit - AI Developer Guidelines

## Project Overview
Minor Cramit is an MVP flashcard app focusing on spaced repetition for competitive exams.
**Tech Stack:** React Native (Expo), WatermelonDB (Offline-first), Supabase (Sync/Auth), NativeWind (Tailwind), TypeScript, Zustand.

## Core Philosophy
1. **Simplicity & Precision:** Implement the simplest correct solution. Avoid over-engineering.
2. **No Silent Assumptions:** Ask if requirements are ambiguous. State tradeoffs.
3. **Preserve Context:** maintain existing comments and style. Do not do "drive-by" refactoring.
4. **Offline-First:** All data operations usually go through WatermelonDB first, then sync to Supabase.

## Workflow Rules
1. **Plan -> Test -> Code -> Cleanup:**
   - Outline the plan.
   - Define/write tests (if applicable).
   - Implement.
   - Remove unused code/logs.
2. **Git Safety:**
   - **NO COMMITTING:** Do NOT run `git commit` or `git push`.
   - **STAGING ONLY:** Run `git add .` when finished.
   - **HANDOFF:** Notify user "Code is staged. Run the 'review' command."
   - **Commiting:** When user asks to commit, ensure `docs/CURRENT_DEVELOPMENT.md` is updated first.

## Technical Standards

### Code Style
- **Formatting:** No semicolons. Single quotes. 2-space indentation (implied).
- **Naming:**
  - Files: PascalCase for Components/Models (`DeckList.tsx`), camelCase for logic/utils.
  - Variables: camelCase.
  - DB Fields: snake_case (e.g., `created_at`).
- **React:** Functional components. Hooks for state.
- **Styling:** NativeWind (Tailwind classes). Example: `className="flex-1 bg-white"`.
- **Database (WatermelonDB):**
  - Use decorators (`@text`, `@date`).
  - Strict typing (`!: string`).
  - Models in `src/db/models/`.

### Commands
- **Start:** `npm start` (Expo)
- **Android:** `npm run android`
- **iOS:** `npm run ios`
- **Tests:** `npm run test:db` (Jest for DB logic)

### Directory Structure
- `src/components`: UI Components
- `src/db`: WatermelonDB setup, models, schema, migrations
- `src/lib`: Utilities
- `src/screens`: App Screens
- `src/store`: Zustand stores

## Database & Sync
- **Schema:** Defined in `src/db/schema.ts` (local) and `supabase_schema.sql` (remote).
- **Sync:** Changes track `created_at`, `updated_at`, and `deleted` flags.
- **Supabase:** Used as the backend for sync.
  - **Schema Updates:** Manual updates via Supabase Dashboard/SQL Editor are preferred to avoid connection pooler issues, though scripts can be used if configured correctly with `pg` and `dotenv`.

## Business Context
- **Goal:** MVP Flashcard app.
- **Users:** Students (competitive exams).
- **Features:** Premade decks (primary), Spaced Repetition (FSRS), Offline support.

## Security
- **Secrets:** NEVER expose `.env` variables in code or logs.
