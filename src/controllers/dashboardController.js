const habitService = require('../services/habitService');

async function renderDashboard(req, res) {
  try {
    const habits = await habitService.getTodayDashboard();
    const allHabits = await habitService.getAllHabitsWithStats();
    const pendingHabits = await habitService.getPendingTodayHabits(1, new Date().toISOString().slice(0, 10));

    res.render('dashboard', {
      title: 'Habit Dashboard',
      habits,
      allHabits,
      pendingHabits,
      error: null,
      success: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('dashboard', {
      title: 'Habit Dashboard',
      habits: [],
      allHabits: [],
      pendingHabits: [],
      error: 'Unable to load the dashboard right now.',
      success: null,
    });
  }
}

module.exports = {
  renderDashboard,
};
