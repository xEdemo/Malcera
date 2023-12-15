const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createForbiddenLibrary,
    getAllForbiddenLibraries,
    updateForbiddenLibrary,
    deleteForbiddenLibrary,
} = require('../controllers/forbiddenLibraryController.js');

// Create a new forbiddenLibrary
router
    .route('/')
    .post([protect, superAdmin], createForbiddenLibrary)
    .get([protect, admin], getAllForbiddenLibraries);
router
    .route('/:forbiddenLibraryId')
    .put([protect, superAdmin], updateForbiddenLibrary)
    .delete([protect, superAdmin], deleteForbiddenLibrary);

module.exports = router;