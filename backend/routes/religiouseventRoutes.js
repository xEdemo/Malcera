const express = require('express');
const router = express.Router();
const religiousEventController = require('../controllers/religiouseventController');

// Create a new religious event
router.post('/', religiousEventController.createReligiousEvent);

// Get all religious events
router.get('/', religiousEventController.getAllReligiousEvents);

// Get a religious event by ID
router.get('/:id', religiousEventController.getReligiousEventById);

// Update a religious event by ID
router.put('/:id', religiousEventController.updateReligiousEvent);

// Delete a religious event by ID
router.delete('/:id', religiousEventController.deleteReligiousEvent);

module.exports = router;
