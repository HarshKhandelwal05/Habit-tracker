const { dayOfWeek } = require('./dateUtils');

function parseCustomWeekdays(raw) {
  if (!raw) return new Set();
  return new Set(
    String(raw)
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
  );
}

function isScheduled(habit, date) {
  if (!habit || !date) return false;

  const dateString = date instanceof Date ? date.toISOString().slice(0, 10) : String(date);
  const weekday = dayOfWeek(dateString);

  if (habit.start_date && dateString < habit.start_date) return false;

  switch (habit.schedule_type) {
    case 'daily':
      return true;
    case 'weekdays':
      return weekday >= 1 && weekday <= 5;
    case 'custom_weekdays': {
      const custom = parseCustomWeekdays(habit.custom_weekdays);
      return custom.has(weekday);
    }
    default:
      return false;
  }
}

module.exports = {
  isScheduled,
  parseCustomWeekdays,
};
