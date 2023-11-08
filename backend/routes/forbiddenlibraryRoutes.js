const express = require('express');
const router = express.Router();
const forbiddenLibraryController = require('../controllers/forbiddenlibraryController');

// Create a new Forbidden Library
router.post('/', forbiddenLibraryController.createForbiddenLibrary);

// Get all Forbidden Libraries
router.get('/', forbiddenLibraryController.getAllForbiddenLibraries);

// Get a specific Forbidden Library by ID
router.get('/:id', forbiddenLibraryController.getForbiddenLibraryById);

// Update a Forbidden Library by ID
router.put('/:id', forbiddenLibraryController.updateForbiddenLibrary);

// Delete a Forbidden Library by ID
router.delete('/:id', forbiddenLibraryController.deleteForbiddenLibrary);

module.exports = router;
