const express = require('express');
const router = express.Router();
const naturalDisasterController = require('../controllers/naturaldisasterController');

// Create a new natural disaster
router.post('/', naturalDisasterController.createNaturalDisaster);

// Get all natural disasters
router.get('/', naturalDisasterController.getAllNaturalDisasters);

// Get a specific natural disaster by ID
router.get('/:disasterId', naturalDisasterController.getNaturalDisasterById);

// Update a natural disaster by ID
router.put('/:disasterId', naturalDisasterController.updateNaturalDisaster);

// Delete a natural disaster by ID
router.delete('/:disasterId', naturalDisasterController.deleteNaturalDisaster);

module.exports = router;
