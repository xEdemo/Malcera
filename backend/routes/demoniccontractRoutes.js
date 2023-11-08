const express = require('express');
const router = express.Router();
const demonicContractController = require('../controllers/demonicContractController');

// Create a new Demonic Contract
router.post('/', demonicContractController.createDemonicContract);

// Get all Demonic Contracts
router.get('/', demonicContractController.getAllDemonicContracts);

// Get a Demonic Contract by ID
router.get('/:id', demonicContractController.getDemonicContractById);

// Update a Demonic Contract by ID
router.put('/:id', demonicContractController.updateDemonicContract);

// Delete a Demonic Contract by ID
router.delete('/:id', demonicContractController.deleteDemonicContract);

module.exports = router;
