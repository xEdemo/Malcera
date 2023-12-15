const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createBlackMarket,
    getAllBlackMarkets,
    updateBlackMarket,
    deleteBlackMarket,
} = require('../controllers/blackMarketController.js');

// Create a new blackmarket
router
    .route('/')
    .post([protect, superAdmin], createBlackMarket)
    .get([protect, admin], getAllBlackMarkets);
router
    .route('/:blackMarketId')
    .put([protect, superAdmin], updateBlackMarket)
    .delete([protect, superAdmin], deleteBlackMarket);

module.exports = router;