const express = require('express');
const router = express.Router();
const dayNightController = require('../controllers/dayNightController.js');

// Get the current day and night information
router.get('/', dayNightController.getCurrentDayNight);

// Update the day and night cycle information
router.put('/:id', dayNightController.updateDayNight);

module.exports = router;
