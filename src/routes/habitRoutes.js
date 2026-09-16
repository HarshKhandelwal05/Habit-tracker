const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

router.get('/habits', habitController.renderHabitList);
router.get('/habits/new', habitController.renderNewHabitForm);
router.post('/habits', habitController.createHabit);
router.get('/habits/:id/edit', habitController.renderEditHabitForm);
router.post('/habits/:id/update', habitController.updateHabit);
router.post('/habits/:id/archive', habitController.archiveHabit);
router.post('/habits/:id/restore', habitController.restoreHabit);
router.post('/habits/:id/complete', habitController.completeHabit);
router.post('/habits/:id/uncomplete', habitController.uncompleteHabit);

module.exports = router;
