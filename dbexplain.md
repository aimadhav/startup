# Database Model Analysis

## Overview
The current database implementation uses **WatermelonDB** with a schema designed to support **FSRS** (Free Spaced Repetition Scheduler). The core models (`Card`, `Deck`, `FsrsLog`) are present and configured with appropriate decorators for React Native.

## Model Analysis

### 1. Card Model (`src/db/models/Card.ts`)
*   **Tech Stack**: Correctly extends `Model` with WatermelonDB decorators (`@text`, `@date`, `@json`).
*   **Super Card Support**: 
    *   **Implemented**: `parent_id` and `cardType` ('super_parent', 'super_child') fields are present. This directly supports the requirement for "Super Card Siblings" and hierarchical sets.
*   **FSRS Support**:
    *   **Implemented**: Includes all standard FSRS fields: `state`, `stability`, `difficulty`, `due`, `last_review`, `reps`, `lapses`.
*   **Content Structure**:
    *   **Generic**: `content` is a JSON field. While flexible, it lacks a specific schema for the "Image & Asset Logic" (file paths, chemical formulas) described in the docs.

### 2. Deck Model (`src/db/models/Deck.ts`)
*   **Structure**: Basic metadata (`title`, `subject`, `category`) allows for the "Library" organization.
*   **Syncing**: `created_at` and `updated_at` are present, which facilitates the Supabase sync.
*   **Missing**: No explicit "Chapter" field, though `category` likely serves this purpose.

### 3. FsrsLog Model (`src/db/models/FsrsLog.ts`)
*   **Purpose**: Tracks review history.
*   **Fields**: Comprehensive tracking (`rating`, `state`, `stability`, `elapsedDays`, `scheduledDays`, `review`). This aligns perfectly with the `ts-fsrs` requirements for optimizing the algorithm.

## Key Alignments
*   ✅ **Tech Stack**: Models are correctly set up for WatermelonDB.
*   ✅ **FSRS Integration**: All necessary fields for the scheduling algorithm are present on the `Card`.
*   ✅ **Hierarchical Cards**: The "Super Card" logic is supported via self-referential fields on `Card`.

## Discrepancies & Gaps

### 1. Missing User & Settings Model
The documentation explicitly mentions **Referral Codes** ("Gated by referral codes") and a **Teacher Portal** where teachers can see student performance.
*   **Gap**: There is no `User` or `Settings` model.
*   **Impact**: Nowhere to store the user's `referral_code`, `name`, or `teacher_id`.

### 2. Tag Querying for "Cram Mode"
The "Library & Cram Mode" requires an "Advanced AND/OR logic for tags" and a "Mistakes Filter".
*   **Gap**: `tags` are stored as a JSON array on the `Card` model.
*   **Issue**: Querying JSON arrays in SQLite (via WatermelonDB) for complex filtering (e.g., "Organic" + "PYQ") can be slow or require complex raw SQL queries.
*   **Mistakes Filter**: The docs ask for a filter for cards with `last_rating < 3`. While `FsrsLog` has this data, joining logs to cards for a real-time list is expensive. The `Card` model lacks a `last_rating` cache field.

### 3. Asset Management Schema
Docs mention "Assets are downloaded to expo-file-system" and rendered via `file:///` URIs.
*   **Gap**: The `Card` model's `content` field is generic JSON. There is no dedicated field for `asset_path` or `local_image_uri` to easily check which cards have downloaded assets vs. missing ones.

## Recommendations

1.  **Create a User Model**:
    *   Add a `User` model (or `Settings` key-value store) to persist `referral_code`, `student_name`, and `teacher_id`.
2.  **Optimize Card Schema for Filtering**:
    *   Add `@field('last_rating')` to `Card`. Update this whenever a review is logged. This makes the "Mistakes Filter" instant.
    *   Consider normalizing tags into a `Tag` model with a `CardTag` join table if filtering performance becomes an issue with thousands of cards. For an MVP, the JSON array is acceptable but requires careful query implementation.
3.  **Formalize Asset Paths**:
    *   Define a strict interface for the `content` JSON or add an `assets` JSON field to track local file paths for images/formulas.
