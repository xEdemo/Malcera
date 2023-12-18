const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createArtifact,
    getAllArtifacts,
    updateArtifact,
    deleteArtifact,
} = require('../controllers/artifactController.js');

// Create a new artifact
router
    .route('/')
    .post([protect, superAdmin], createArtifact)
    .get([protect, admin], getAllArtifacts);
router
    .route('/:artifactId')
    .put([protect, superAdmin], updateArtifact)
    .delete([protect, superAdmin], deleteArtifact);

module.exports = router;
