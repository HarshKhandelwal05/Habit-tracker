const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'habit-tracker.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  }
});

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.exec(
      `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          timezone TEXT NOT NULL DEFAULT 'UTC',
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS habits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          schedule_type TEXT NOT NULL CHECK(schedule_type IN ('daily', 'weekdays', 'custom_weekdays')),
          custom_weekdays TEXT,
          is_archived INTEGER NOT NULL DEFAULT 0,
          start_date TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS habit_completions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          habit_id INTEGER NOT NULL,
          date_key TEXT NOT NULL,
          completed_at TEXT NOT NULL,
          UNIQUE(habit_id, date_key),
          FOREIGN KEY(habit_id) REFERENCES habits(id)
        );

        INSERT OR IGNORE INTO users (id, name, timezone, created_at)
        VALUES (1, 'Default User', 'UTC', datetime('now'));
      `,
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function closeDb() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { db, initializeDatabase, closeDb };
