const express = require('express');
const router = express.Router();
const mountController = require('../controllers/mountController');

// Create a new mount
router.post('/', mountController.createMount);

// Get all mounts
router.get('/', mountController.getAllMounts);

// Update a mount by ID
router.put('/:mountId', mountController.updateMount);

// Delete a mount by ID
router.delete('/:mountId', mountController.deleteMount);

module.exports = router;
