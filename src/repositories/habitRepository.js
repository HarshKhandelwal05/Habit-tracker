const { db } = require('../../config/db');

function listHabits() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM habits ORDER BY is_archived ASC, created_at DESC`,
      [],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

function getHabitById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM habits WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

function createHabit(habitData) {
  return new Promise((resolve, reject) => {
    const {
      user_id,
      name,
      schedule_type,
      custom_weekdays,
      is_archived,
      start_date,
      created_at,
      updated_at,
    } = habitData;

    db.run(
      `INSERT INTO habits (user_id, name, schedule_type, custom_weekdays, is_archived, start_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, name, schedule_type, custom_weekdays || null, is_archived ? 1 : 0, start_date, created_at, updated_at],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

function updateHabit(id, updates) {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (!fields.length) return resolve(0);

    values.push(id);

    db.run(
      `UPDATE habits SET ${fields.join(', ')} WHERE id = ?`,
      values,
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
}

function archiveHabit(id) {
  return updateHabit(id, { is_archived: 1, updated_at: new Date().toISOString() });
}

function restoreHabit(id) {
  return updateHabit(id, { is_archived: 0, updated_at: new Date().toISOString() });
}

function searchHabits(query) {
  return new Promise((resolve, reject) => {
    const normalized = `%${query}%`;
    db.all(
      `SELECT * FROM habits WHERE name LIKE ? ORDER BY is_archived ASC, created_at DESC`,
      [normalized],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

module.exports = {
  listHabits,
  getHabitById,
  createHabit,
  updateHabit,
  archiveHabit,
  restoreHabit,
  searchHabits,
};
