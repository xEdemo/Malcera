const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createBank,
    getAllBanks,
    updateBank,
    deleteBank,
} = require('../controllers/bankController.js');

// Create a new bank
router
    .route('/')
    .post([protect, superAdmin], createBank)
    .get([protect, admin], getAllBanks);
router
    .route('/:bankId')
    .put([protect, superAdmin], updateBank)
    .delete([protect, superAdmin], deleteBank);

module.exports = router;