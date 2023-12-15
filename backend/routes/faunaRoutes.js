const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createFauna,
    getAllFaunas,
    updateFauna,
    deleteFauna,
} = require('../controllers/faunaController.js');

// Create a new fauna
router
    .route('/')
    .post([protect, superAdmin], createFauna)
    .get([protect, admin], getAllFaunas);
router
    .route('/:faunaId')
    .put([protect, superAdmin], updateFauna)
    .delete([protect, superAdmin], deleteFauna);

module.exports = router;