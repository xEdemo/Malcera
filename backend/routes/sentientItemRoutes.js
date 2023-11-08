const express = require('express');
const router = express.Router();
const sentientItemController = require('../controllers/sentientItemController.js');

// Create a new sentient item
router.post('/', sentientItemController.createSentientItem);

// Get all sentient items
router.get('/', sentientItemController.getAllSentientItems);

// Get a sentient item by ID
router.get('/:id', sentientItemController.getSentientItemById);

// Update a sentient item by ID
router.put('/:id', sentientItemController.updateSentientItem);

// Delete a sentient item by ID
router.delete('/:id', sentientItemController.deleteSentientItem);

module.exports = router;
