# Minor Cramit - App Context & FSRS Logic

## 1. Business Context
**Target Audience:** Students preparing for competitive exams in India (JEE, NEET).
**Scale:** 
- **Subjects:** Physics, Chemistry, (2 major subjects).
- **Structure:** ~30-33 chapters per subject.
- **Volume:** 200-300 flashcards per chapter.

- **Card Types:**
  - **Fundamental:** Basic definitions, formulas. 
    - *Strategy:* Assign higher initial stability or lower difficulty. We don't want students wasting time reviewing "What is the symbol for Hydrogen?" repeatedly.
  - **Applied:** Problem-solving steps, tricky concepts. 
    - *Strategy:* Standard FSRS handling, likely starting with lower stability.

## 2. The Problem
Competitive exams require retaining vast amounts of information over 1-2 years. Students often forget early chapters by the time they reach the end. 
**Solution:** FSRS (Free Spaced Repetition Scheduler) v5.
- Optimizes review intervals based on memory stability and difficulty.
- Adapts to the user's forgetfulness.

## 3. FSRS Implementation Details
We use the `ts-fsrs` library.
- **Inputs:** Current `stability`, `difficulty`, `due_date`, and user `rating` (Again=1, Hard=2, Good=3, Easy=4).
- **Outputs:** New `stability`, `difficulty`, `due_date`.
- **Database Mapping:**
  - `cards` table stores the *current* state (S, D, due).
  - `fsrs_logs` table stores the history of reviews (critical for the FSRS optimizer to work later).

## 4. Simulation Goal
We need to simulate a student's journey over 1-2 years to verify:
also consider dropper an all who start prepareing in may - june and have exams in jan.
1.  **Workload Management:** Does the "Due" count explode to 500+ reviews/day?
2.  **Retention:** Does the algorithm actually prioritize weak areas?
3.  **Edge Cases:** What happens if a student skips 1 month?
4.  **Real World Nuance:**
    - **IQ/Retention:** Not all students forget at the same rate.
    - **Speed:** Some clear 50 cards/hr, others 20.
    - **Mood/Consistency:** Students aren't robots. They have "bad days" (lower accuracy) and "breaks" (vacations/illness).
    - **Burnout:** If the queue > 500, does the student quit?

## 5. Environment
- **Python:** The simulation agent will likely use Python (e.g., `fsrs-optimizer` or `fsrs` pypi package) to model this rapidly without running the full React Native app.

also try to do tweaks yourself to differt things spin up differnt models to make sure students have the least load and most gains i am ready to chnage my buisness model from your finding i dotn want any studnt to do more than 20-30 min or flash card revesion per day.
