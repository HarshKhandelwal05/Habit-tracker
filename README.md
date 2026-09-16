# Habit Tracker MVP

A lightweight habit tracker built for a 150-minute Builder Round. It supports daily and weekday habits, streak tracking, soft archive, and idempotent completion logging.

## Stack
- Node.js
- Express.js
- EJS
- SQLite
- Vanilla JavaScript + CSS

## Features
- Create, edit, and search habits
- Daily and weekday schedules
- Today dashboard showing only scheduled habits
- Morning reminder section for scheduled habits not yet logged today
- Mark/unmark habits as complete for the current date
- Current streak and best-ever streak tracking
- Soft archive without deleting completion history
- Server-side validation and graceful database error handling

## Run locally
1. Install dependencies:
   npm install
2. Start the app:
   npm start
3. Open the app in a browser:
   http://localhost:3000

## Scripts
- npm start — run the app
- npm run dev — run with nodemon
- npm run init-db — initialize SQLite schema
- npm test — run the core domain tests

## Notes
This MVP is intentionally minimal and reliable for the timebox. It is designed as a general habit tracker, not as a single-user app tied to one personal habit list.
