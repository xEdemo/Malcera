const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createResource,
    getAllResources,
    updateResource,
    deleteResource,
} = require('../controllers/resourceController.js');

// Create a new resource
router
    .route('/')
    .post([protect, superAdmin], createResource)
    .get([protect, admin], getAllResources);
router
    .route('/:resourceId')
    .put([protect, superAdmin], updateResource)
    .delete([protect, superAdmin], deleteResource);

module.exports = router;
