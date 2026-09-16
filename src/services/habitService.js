const { toISODate } = require('../domain/dateUtils');
const { isScheduled } = require('../domain/schedule');
const { calculateCurrentStreak, calculateBestStreak, getScheduledDates } = require('../domain/streak');
const habitRepository = require('../repositories/habitRepository');
const completionRepository = require('../repositories/completionRepository');

async function listHabits() {
  return habitRepository.listHabits();
}

async function getHabitById(id) {
  return habitRepository.getHabitById(id);
}

async function createHabit(payload = {}) {
  const name = String(payload.name || '').trim();
  const scheduleType = payload.schedule_type;

  if (!name) {
    const err = new Error('Habit name is required.');
    err.statusCode = 400;
    throw err;
  }

  if (!['daily', 'weekdays', 'custom_weekdays'].includes(scheduleType)) {
    const err = new Error('Invalid schedule type.');
    err.statusCode = 400;
    throw err;
  }

  if (scheduleType === 'custom_weekdays') {
    const selected = String(payload.custom_weekdays || '').split(',').map((value) => value.trim());
    const valid = selected.filter((value) => value !== '');
    if (!valid.length) {
      const err = new Error('Custom schedule requires at least one selected weekday.');
      err.statusCode = 400;
      throw err;
    }
  }

  const now = new Date().toISOString();
  const startDate = payload.start_date || toISODate(new Date());

  const id = await habitRepository.createHabit({
    user_id: 1,
    name,
    schedule_type: scheduleType,
    custom_weekdays: payload.custom_weekdays || null,
    is_archived: Boolean(payload.is_archived),
    start_date: startDate,
    created_at: now,
    updated_at: now,
  });

  return id;
}

async function updateHabit(id, payload = {}) {
  const habit = await habitRepository.getHabitById(id);
  if (!habit) {
    const err = new Error('Habit not found.');
    err.statusCode = 404;
    throw err;
  }

  const updates = {};

  if (payload.name !== undefined) {
    const name = String(payload.name).trim();
    if (!name) {
      const err = new Error('Habit name is required.');
      err.statusCode = 400;
      throw err;
    }
    updates.name = name;
  }

  if (payload.schedule_type !== undefined) {
    if (!['daily', 'weekdays', 'custom_weekdays'].includes(payload.schedule_type)) {
      const err = new Error('Invalid schedule type.');
      err.statusCode = 400;
      throw err;
    }
    updates.schedule_type = payload.schedule_type;
  }

  if (payload.custom_weekdays !== undefined) {
    updates.custom_weekdays = payload.custom_weekdays || null;
  }

  if (payload.start_date !== undefined) {
    updates.start_date = payload.start_date;
  }

  updates.updated_at = new Date().toISOString();

  return habitRepository.updateHabit(id, updates);
}

async function archiveHabit(id) {
  const habit = await habitRepository.getHabitById(id);
  if (!habit) {
    const err = new Error('Habit not found.');
    err.statusCode = 404;
    throw err;
  }

  return habitRepository.archiveHabit(id);
}

async function restoreHabit(id) {
  const habit = await habitRepository.getHabitById(id);
  if (!habit) {
    const err = new Error('Habit not found.');
    err.statusCode = 404;
    throw err;
  }

  return habitRepository.restoreHabit(id);
}

async function searchHabits(query) {
  const q = String(query || '').trim();
  if (!q) return listHabits();
  return habitRepository.searchHabits(q);
}

async function getTodayDashboard() {
  const habits = await listHabits();
  const today = toISODate(new Date());

  const items = [];

  for (const habit of habits) {
    if (habit.is_archived) continue;
    if (!isScheduled(habit, today)) continue;

    const completedDates = await completionRepository.getCompletedDates(habit.id);
    const currentStreak = calculateCurrentStreak(habit, completedDates, today);
    const bestStreak = calculateBestStreak(habit, completedDates, today);
    const isComplete = completedDates.includes(today);

    items.push({
      ...habit,
      current_streak: currentStreak,
      best_streak: bestStreak,
      is_complete: isComplete,
    });
  }

  return items;
}

async function getHabitWithStats(habitId) {
  const habit = await habitRepository.getHabitById(habitId);
  if (!habit) {
    const err = new Error('Habit not found.');
    err.statusCode = 404;
    throw err;
  }

  const completedDates = await completionRepository.getCompletedDates(habitId);
  const today = toISODate(new Date());

  return {
    ...habit,
    current_streak: calculateCurrentStreak(habit, completedDates, today),
    best_streak: calculateBestStreak(habit, completedDates, today),
    is_complete: completedDates.includes(today),
    completed_dates: completedDates,
  };
}

async function getAllHabitsWithStats() {
  const habits = await listHabits();
  const today = toISODate(new Date());

  const mapped = [];
  for (const habit of habits) {
    const completedDates = await completionRepository.getCompletedDates(habit.id);
    mapped.push({
      ...habit,
      current_streak: calculateCurrentStreak(habit, completedDates, today),
      best_streak: calculateBestStreak(habit, completedDates, today),
      is_complete: completedDates.includes(today),
    });
  }

  return mapped;
}

async function getPendingTodayHabits(userId = 1, today = toISODate(new Date())) {
  const habits = await listHabits();
  const pending = [];

  for (const habit of habits) {
    if (habit.user_id !== userId) continue;
    if (habit.is_archived) continue;
    if (!isScheduled(habit, today)) continue;

    const completedDates = await completionRepository.getCompletedDates(habit.id);
    if (completedDates.includes(today)) continue;

    pending.push({
      ...habit,
      scheduled_for_today: true,
      is_complete: false,
    });
  }

  return pending;
}

module.exports = {
  listHabits,
  getHabitById,
  createHabit,
  updateHabit,
  archiveHabit,
  restoreHabit,
  searchHabits,
  getTodayDashboard,
  getPendingTodayHabits,
  getHabitWithStats,
  getAllHabitsWithStats,
};
