const test = require('node:test');
const assert = require('node:assert/strict');

const { isScheduled } = require('../src/domain/schedule');
const { calculateCurrentStreak, calculateBestStreak } = require('../src/domain/streak');
const habitService = require('../src/services/habitService');

const asDate = (value) => new Date(value + 'T12:00:00Z');

test('daily schedule is true for every date', () => {
  const habit = { schedule_type: 'daily', start_date: '2026-09-01' };
  assert.equal(isScheduled(habit, asDate('2026-09-03')), true);
});

test('weekday schedule ignores weekends', () => {
  const habit = { schedule_type: 'weekdays', start_date: '2026-09-01' };
  assert.equal(isScheduled(habit, asDate('2026-09-05')), false); // Saturday
  assert.equal(isScheduled(habit, asDate('2026-09-06')), false); // Sunday
  assert.equal(isScheduled(habit, asDate('2026-09-07')), true); // Monday
});

test('custom weekday schedule respects selected weekdays', () => {
  const habit = { schedule_type: 'custom_weekdays', custom_weekdays: '1,3,5', start_date: '2026-09-01' };
  assert.equal(isScheduled(habit, asDate('2026-09-02')), true); // Wednesday = 3
  assert.equal(isScheduled(habit, asDate('2026-09-03')), false); // Thursday = 4
  assert.equal(isScheduled(habit, asDate('2026-09-04')), true); // Friday = 5
});

test('current streak preserves previous run when today is scheduled but incomplete', () => {
  const habit = { id: 1, schedule_type: 'daily', start_date: '2026-09-01' };
  const completed = ['2026-09-01', '2026-09-02', '2026-09-03'];
  const current = calculateCurrentStreak(habit, completed, '2026-09-04');
  assert.equal(current, 3);
});

test('missed scheduled occurrence breaks the streak', () => {
  const habit = { id: 1, schedule_type: 'daily', start_date: '2026-09-01' };
  const completed = ['2026-09-01', '2026-09-03'];
  const current = calculateCurrentStreak(habit, completed, '2026-09-03');
  assert.equal(current, 1);
});

test('today incomplete retains prior streak instead of resetting to zero', () => {
  const habit = { id: 1, schedule_type: 'daily', start_date: '2026-09-01' };
  const completed = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05'];
  const current = calculateCurrentStreak(habit, completed, '2026-09-06');
  assert.equal(current, 5);
});

test('best streak is the longest completed run', () => {
  const habit = { id: 1, schedule_type: 'daily', start_date: '2026-09-01' };
  const completed = ['2026-09-01', '2026-09-02', '2026-09-04', '2026-09-05', '2026-09-06'];
  const best = calculateBestStreak(habit, completed, '2026-09-06');
  assert.equal(best, 3);
});

test('today scheduled and incomplete habit appears in reminders', async () => {
  const today = '2026-09-16';
  const habit = {
    user_id: 1,
    name: 'Drink Water',
    schedule_type: 'daily',
    custom_weekdays: null,
    is_archived: 0,
    start_date: today,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existing = await require('../src/repositories/habitRepository').createHabit(habit);
  const pending = await habitService.getPendingTodayHabits(1, today);

  assert.ok(pending.some((entry) => entry.name === 'Drink Water' && entry.id === existing));

  await require('../src/repositories/habitRepository').archiveHabit(existing);
});

test('today scheduled and completed habit does not appear in reminders', async () => {
  const today = '2026-09-16';
  const habit = {
    id: 999,
    user_id: 1,
    name: 'Read Book',
    schedule_type: 'daily',
    custom_weekdays: null,
    is_archived: 0,
    start_date: today,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existing = await require('../src/repositories/habitRepository').createHabit(habit);
  await require('../src/repositories/completionRepository').completeHabitForDate(existing, today);

  const pending = await habitService.getPendingTodayHabits(1, today);
  assert.ok(!pending.some((entry) => entry.id === existing));

  await require('../src/repositories/completionRepository').uncompleteHabitForDate(existing, today);
  await require('../src/repositories/habitRepository').archiveHabit(existing);
});

test('archived habit does not appear in reminders', async () => {
  const today = '2026-09-16';
  const habit = {
    id: 998,
    user_id: 1,
    name: 'Meditate',
    schedule_type: 'daily',
    custom_weekdays: null,
    is_archived: 1,
    start_date: today,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existing = await require('../src/repositories/habitRepository').createHabit(habit);
  const pending = await habitService.getPendingTodayHabits(1, today);
  assert.ok(!pending.some((entry) => entry.id === existing));

  await require('../src/repositories/habitRepository').archiveHabit(existing);
});

test('weekday-only habit does not appear on weekend', async () => {
  const saturday = '2026-09-19';
  const habit = {
    id: 997,
    user_id: 1,
    name: 'Workout',
    schedule_type: 'weekdays',
    custom_weekdays: null,
    is_archived: 0,
    start_date: '2026-09-14',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existing = await require('../src/repositories/habitRepository').createHabit(habit);
  const pending = await habitService.getPendingTodayHabits(1, saturday);
  assert.ok(!pending.some((entry) => entry.id === existing));

  await require('../src/repositories/habitRepository').archiveHabit(existing);
});

test('all todays habits completed produces the completed message', async () => {
  const today = '2026-09-16';
  const habit = {
    id: 996,
    user_id: 1,
    name: 'Stretch',
    schedule_type: 'daily',
    custom_weekdays: null,
    is_archived: 0,
    start_date: today,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existing = await require('../src/repositories/habitRepository').createHabit(habit);
  await require('../src/repositories/completionRepository').completeHabitForDate(existing, today);

  const pending = await habitService.getPendingTodayHabits(1, today);
  assert.equal(pending.length, 0);

  await require('../src/repositories/completionRepository').uncompleteHabitForDate(existing, today);
  await require('../src/repositories/habitRepository').archiveHabit(existing);
});
