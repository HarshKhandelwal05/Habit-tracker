const { toISODate } = require('../domain/dateUtils');
const completionRepository = require('../repositories/completionRepository');
const habitRepository = require('../repositories/habitRepository');

async function completeHabit(habitId) {
  const habit = await habitRepository.getHabitById(habitId);
  if (!habit) {
    const err = new Error('Habit not found.');
    err.statusCode = 404;
    throw err;
  }

  const today = toISODate(new Date());
  const existing = await completionRepository.getCompletedDates(habitId);

  if (existing.includes(today)) {
    return { alreadyCompleted: true, dateKey: today };
  }

  const result = await completionRepository.completeHabitForDate(habitId, today);
  return { alreadyCompleted: false, ...result };
}

async function uncompleteHabit(habitId) {
  const habit = await habitRepository.getHabitById(habitId);
  if (!habit) {
    const err = new Error('Habit not found.');
    err.statusCode = 404;
    throw err;
  }

  const today = toISODate(new Date());
  const deleted = await completionRepository.uncompleteHabitForDate(habitId, today);
  return { deletedCount: deleted };
}

module.exports = {
  completeHabit,
  uncompleteHabit,
};
