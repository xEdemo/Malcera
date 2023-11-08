const express = require('express');
const router = express.Router();
const templeController = require('../controllers/templeController');

// Create a new temple
router.post('/', templeController.createTemple);

// Get all temples
router.get('/', templeController.getAllTemples);

// Get a specific temple by ID
router.get('/:templeId', templeController.getTempleById);

// Update a temple by ID
router.put('/:templeId', templeController.updateTemple);

// Delete a temple by ID
router.delete('/:templeId', templeController.deleteTemple);

module.exports = router;
