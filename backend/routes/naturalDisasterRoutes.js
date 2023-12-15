const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createNaturalDisaster,
    getAllNaturalDisasters,
    updateNaturalDisaster,
    deleteNaturalDisaster,
} = require('../controllers/naturalDisasterController.js');

// Create a new naturalDisaster
router
    .route('/')
    .post([protect, superAdmin], createNaturalDisaster)
    .get([protect, admin], getAllNaturalDisasters);
router
    .route('/:mountId')
    .put([protect, superAdmin], updateNaturalDisaster)
    .delete([protect, superAdmin], deleteNaturalDisaster);

module.exports = router;