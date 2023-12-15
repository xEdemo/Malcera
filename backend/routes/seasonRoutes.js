const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createSeason,
    getAllSeasons,
    updateSeason,
    deleteSeason,
} = require('../controllers/seasonController.js');

// Create a new season
router
    .route('/')
    .post([protect, superAdmin], createSeason)
    .get([protect, admin], getAllSeasons);
router
    .route('/:seasonId')
    .put([protect, superAdmin], updateSeason)
    .delete([protect, superAdmin], deleteSeason);

module.exports = router;
