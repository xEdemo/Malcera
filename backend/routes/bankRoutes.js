const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');

// Create a new bank
router.post('/', bankController.createBank);

// Get all banks
router.get('/', bankController.getAllBanks);

// Update a bank by ID
router.put('/:bankId', bankController.updateBank);

// Delete a bank by ID
router.delete('/:bankId', bankController.deleteBank);

module.exports = router;
