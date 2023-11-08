const express = require('express');
const router = express.Router();
const blackMarketController = require('../controllers/blackMarketController.js');

// Create a new Black Market
router.post('/', blackMarketController.createBlackMarket);

// Get all Black Markets
router.get('/', blackMarketController.getAllBlackMarkets);

// Get a Black Market by ID
router.get('/:marketId', blackMarketController.getBlackMarketById);

// Update a Black Market by ID
router.put('/:marketId', blackMarketController.updateBlackMarket);

// Delete a Black Market by ID
router.delete('/:marketId', blackMarketController.deleteBlackMarket);

module.exports = router;
