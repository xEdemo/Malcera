const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createLostTreasure,
    getAllLostTreasures,
    updateLostTreasure,
    deleteLostTreasure,
} = require('../controllers/lostTreasureController.js');

// Create a new mount
router
    .route('/')
    .post([protect, superAdmin], createLostTreasure)
    .get([protect, admin], getAllLostTreasures);
router
    .route('/:lostTreasureId')
    .put([protect, superAdmin], updateLostTreasure)
    .delete([protect, superAdmin], deleteLostTreasure);

module.exports = router;