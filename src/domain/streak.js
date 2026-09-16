const { addDays, parseISODate } = require('./dateUtils');
const { isScheduled } = require('./schedule');

function getScheduledDates(habit, startDate, endDate) {
  const dates = [];
  let current = startDate;
  while (current <= endDate) {
    if (isScheduled(habit, current)) {
      dates.push(current);
    }
    current = addDays(current, 1);
  }
  return dates;
}

function calculateBestStreak(habit, completedDates, asOfDate = null) {
  const completedSet = new Set(completedDates || []);
  const endDate = asOfDate || completedDates[completedDates.length - 1] || habit.start_date;

  if (!habit.start_date) {
    return 0;
  }

  const scheduledDates = getScheduledDates(habit, habit.start_date, endDate);
  if (!scheduledDates.length) return 0;

  let best = 0;
  let current = 0;

  for (const date of scheduledDates) {
    if (completedSet.has(date)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }

  return best;
}

function calculateCurrentStreak(habit, completedDates, asOfDate) {
  const completedSet = new Set(completedDates || []);
  const endDate = asOfDate || new Date().toISOString().slice(0, 10);
  const startDate = habit.start_date || endDate;

  const scheduledDates = getScheduledDates(habit, startDate, endDate);
  if (!scheduledDates.length) return 0;

  for (let i = scheduledDates.length - 1; i >= 0; i -= 1) {
    const date = scheduledDates[i];

    if (!completedSet.has(date)) {
      continue;
    }

    let streak = 1;
    let cursor = i - 1;

    while (cursor >= 0) {
      const previousDate = scheduledDates[cursor];
      if (completedSet.has(previousDate)) {
        streak += 1;
        cursor -= 1;
      } else {
        break;
      }
    }

    return streak;
  }

  return 0;
}

module.exports = {
  getScheduledDates,
  calculateBestStreak,
  calculateCurrentStreak,
};
