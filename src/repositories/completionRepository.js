const { db } = require('../../config/db');

function getCompletedDates(habitId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT date_key FROM habit_completions WHERE habit_id = ? ORDER BY date_key ASC`,
      [habitId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map((row) => row.date_key));
      }
    );
  });
}

function completeHabitForDate(habitId, dateKey) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO habit_completions (habit_id, date_key, completed_at)
       VALUES (?, ?, ?)`,
      [habitId, dateKey, new Date().toISOString()],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, habitId, dateKey });
      }
    );
  });
}

function uncompleteHabitForDate(habitId, dateKey) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM habit_completions WHERE habit_id = ? AND date_key = ?`,
      [habitId, dateKey],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
}

module.exports = {
  getCompletedDates,
  completeHabitForDate,
  uncompleteHabitForDate,
};
