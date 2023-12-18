const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createSentientItem,
    getAllSentientItems,
    updateSentientItem,
    deleteSentientItem,
} = require('../controllers/sentientItemController');

// Create a new sentientItem
router
    .route('/')
    .post([protect, superAdmin], createSentientItem)
    .get([protect, admin], getAllSentientItems);
router
    .route('/:sentientItemId')
    .put([protect, superAdmin], updateSentientItem)
    .delete([protect, superAdmin], deleteSentientItem);

module.exports = router;
