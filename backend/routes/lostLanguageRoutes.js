const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createLostLanguage,
    getAllLostLanguages,
    updateLostLanguage,
    deleteLostLanguage,
} = require('../controllers/lostLanguageController.js');

// Create a new mount
router
    .route('/')
    .post([protect, superAdmin], createLostLanguage)
    .get([protect, admin], getAllLostLanguages);
router
    .route('/:lostLanguageId')
    .put([protect, superAdmin], updateLostLanguage)
    .delete([protect, superAdmin], deleteLostLanguage);

module.exports = router;