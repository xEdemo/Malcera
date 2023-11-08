const express = require('express');
const router = express.Router();
const lostTreasureController = require('../controllers/lostTreasureController');

// Create a new Lost Treasure
router.post('/', lostTreasureController.createLostTreasure);

// Get all Lost Treasures
router.get('/', lostTreasureController.getAllLostTreasures);

// Update a Lost Treasure by ID
router.put('/:id', lostTreasureController.updateLostTreasure);

// Delete a Lost Treasure by ID
router.delete('/:id', lostTreasureController.deleteLostTreasure);

module.exports = router;
