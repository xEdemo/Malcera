const express = require('express');
const router = express.Router();
const lostLanguageController = require('../controllers/lostLanguageController.js');

// Create a new Lost Language
router.post('/', lostLanguageController.createLostLanguage);

// Get all Lost Languages
router.get('/', lostLanguageController.getAllLostLanguages);

// Update a Lost Language by ID
router.put('/:languageId', lostLanguageController.updateLostLanguage);

// Delete a Lost Language by ID
router.delete('/:languageId', lostLanguageController.deleteLostLanguage);

module.exports = router;
