const habitService = require('../services/habitService');
const completionService = require('../services/completionService');

async function renderHabitList(req, res) {
  try {
    const query = req.query.q || '';
    const habits = await habitService.searchHabits(query);

    res.render('habits', {
      title: 'Habits',
      habits,
      query,
      error: null,
      success: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('habits', {
      title: 'Habits',
      habits: [],
      query: '',
      error: 'Unable to load habits.',
      success: null,
    });
  }
}

async function renderNewHabitForm(req, res) {
  res.render('habitEdit', {
    title: 'New Habit',
    habit: null,
    mode: 'new',
    error: null,
    success: null,
  });
}

async function createHabit(req, res) {
  try {
    const habitId = await habitService.createHabit(req.body);
    res.redirect('/habits');
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).render('habitEdit', {
      title: 'New Habit',
      habit: { ...req.body },
      mode: 'new',
      error: error.message || 'Unable to create habit.',
      success: null,
    });
  }
}

async function renderEditHabitForm(req, res) {
  try {
    const habit = await habitService.getHabitById(req.params.id);
    if (!habit) {
      return res.status(404).render('habitEdit', {
        title: 'Edit Habit',
        habit: null,
        mode: 'edit',
        error: 'Habit not found.',
        success: null,
      });
    }

    res.render('habitEdit', {
      title: 'Edit Habit',
      habit,
      mode: 'edit',
      error: null,
      success: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('habitEdit', {
      title: 'Edit Habit',
      habit: null,
      mode: 'edit',
      error: 'Unable to load habit.',
      success: null,
    });
  }
}

async function updateHabit(req, res) {
  try {
    await habitService.updateHabit(req.params.id, req.body);
    res.redirect('/habits');
  } catch (error) {
    console.error(error);
    const habit = await habitService.getHabitById(req.params.id);
    res.status(error.statusCode || 500).render('habitEdit', {
      title: 'Edit Habit',
      habit: habit || { ...req.body },
      mode: 'edit',
      error: error.message || 'Unable to update habit.',
      success: null,
    });
  }
}

async function archiveHabit(req, res) {
  try {
    await habitService.archiveHabit(req.params.id);
    res.redirect('/habits');
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).send(error.message || 'Unable to archive habit.');
  }
}

async function restoreHabit(req, res) {
  try {
    await habitService.restoreHabit(req.params.id);
    res.redirect('/habits');
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).send(error.message || 'Unable to restore habit.');
  }
}

async function completeHabit(req, res) {
  try {
    await completionService.completeHabit(req.params.id);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).send(error.message || 'Unable to complete habit.');
  }
}

async function uncompleteHabit(req, res) {
  try {
    await completionService.uncompleteHabit(req.params.id);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).send(error.message || 'Unable to uncomplete habit.');
  }
}

module.exports = {
  renderHabitList,
  renderNewHabitForm,
  createHabit,
  renderEditHabitForm,
  updateHabit,
  archiveHabit,
  restoreHabit,
  completeHabit,
  uncompleteHabit,
};
