const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/seasonController.js');

// Get all seasons
router.get('/', seasonController.getSeasons);

// Get the current season
router.get('/current', seasonController.getCurrentSeason);

// Create a new season
router.post('/', seasonController.createSeason);

// Update a season by ID
router.put('/:seasonId', seasonController.updateSeason);

// Delete a season by ID
router.delete('/:seasonId', seasonController.deleteSeason);

module.exports = router;
