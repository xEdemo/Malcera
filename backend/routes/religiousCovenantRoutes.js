const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createReligiousCovenant,
    getAllReligiousCovenants,
    updateReligiousCovenant,
    deleteReligiousCovenant,
} = require('../controllers/religiousCovenantController.js');

// Create a new religiousCovenant
router
    .route('/')
    .post([protect, superAdmin], createReligiousCovenant)
    .get([protect, admin], getAllReligiousCovenants);
router
    .route('/:religiousCovenantId')
    .put([protect, superAdmin], updateReligiousCovenant)
    .delete([protect, superAdmin], deleteReligiousCovenant);

module.exports = router;
