const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createFlora,
    getAllFloras,
    updateFlora,
    deleteFlora,
} = require('../controllers/floraController.js');

// Create a new flora
router
    .route('/')
    .post([protect, superAdmin], createFlora)
    .get([protect, admin], getAllFloras);
router
    .route('/:floraId')
    .put([protect, superAdmin], updateFlora)
    .delete([protect, superAdmin], deleteFlora);

module.exports = router;