const express = require('express');
const router = express.Router();
const religiousOrderController = require('../controllers/religiousOrderController.js');

// Create a new religious order
router.post('/', religiousOrderController.createReligiousOrder);

// Get all religious orders
router.get('/', religiousOrderController.getAllReligiousOrders);

// Get a specific religious order by ID
router.get('/:id', religiousOrderController.getReligiousOrderById);

// Update a specific religious order by ID
router.put('/:id', religiousOrderController.updateReligiousOrder);

// Delete a specific religious order by ID
router.delete('/:id', religiousOrderController.deleteReligiousOrder);

module.exports = router;
