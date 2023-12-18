const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createTemple,
    getAllTemples,
    updateTemple,
    deleteTemple,
} = require('../controllers/templeController.js');

// Create a new temple
router
    .route('/')
    .post([protect, superAdmin], createTemple)
    .get([protect, admin], getAllTemples);
router
    .route('/:templeId')
    .put([protect, superAdmin], updateTemple)
    .delete([protect, superAdmin], deleteTemple);

module.exports = router;
