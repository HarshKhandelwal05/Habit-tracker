function toISODate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateString, amount) {
  const date = new Date(dateString + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + amount);
  return toISODate(date);
}

function parseISODate(dateString) {
  return new Date(dateString + 'T12:00:00Z');
}

function dayOfWeek(dateString) {
  return parseISODate(dateString).getUTCDay();
}

function isSameDate(a, b) {
  return toISODate(a) === toISODate(b);
}

module.exports = {
  toISODate,
  addDays,
  parseISODate,
  dayOfWeek,
  isSameDate,
};
