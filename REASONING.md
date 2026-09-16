# Reasoning and product decisions

## Product goal
The Habit Tracker MVP is designed to help a user maintain streaks with the least possible friction, while staying general-purpose for any habit routine.

## Key product decisions

### 1. Focus on daily use
The app centers on a single morning dashboard that shows only today’s scheduled habits. This keeps the product aligned with the requirement that the user wants a quick daily checklist.

### 2. Soft archive instead of deletion
Archived habits are hidden from the dashboard but kept in the database with full history so the user can remove them from the active list without destroying streak data.

### 3. Schedule-driven logic
Both the dashboard and streak calculations are driven by a single schedule evaluator rather than UI assumptions. This keeps the logic reusable and makes future custom rules easier to add.

### 4. Streak semantics match real habit tracking
The core rule is:
- current streak = consecutive completed scheduled occurrences ending at the most recent completed scheduled occurrence
- if today is scheduled but not completed yet, the previous completed streak remains in effect
- a missed scheduled occurrence breaks the streak
- weekends do not break a weekday-only habit's streak
- best streak = maximum number of consecutive completed scheduled occurrences

### 5. In-app morning reminders
The dashboard calculates which scheduled habits remain incomplete for today and surfaces them in a “Morning Reminders” section. This is not a background system or external notification; it is generated when the user opens the app and is computed from the same schedule and completion logic used elsewhere.

### 6. Idempotent completion
The habit_completions table enforces uniqueness on habit_id + date_key to ensure duplicate clicks or retries do not create duplicate records.

### 6. Minimal but reliable MVP stack
The chosen stack prioritizes implementation reliability within the 150-minute limit rather than framework novelty. EJS + Express + SQLite keeps the system small, fast, and easy to reason about.

## Risks addressed
- duplicate completion entries
- incorrect streak resets on incomplete today
- weekend miscounting for weekday habits
- schedule logic spread across UI
- hard-delete destroying habit history

## Future extension path
If time permits later, the scheduling layer can support more rules without changing the streak engine by extending the single isScheduled() evaluator. The same applies to habits with custom exceptions, timed reminders, or richer analytics.
