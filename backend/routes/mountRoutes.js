const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createMount,
    getAllMounts,
    updateMount,
    deleteMount,
} = require('../controllers/mountController.js');

// Create a new mount
router
    .route('/')
    .post([protect, superAdmin], createMount)
    .get([protect, admin], getAllMounts);
router
    .route('/:mountId')
    .put([protect, superAdmin], updateMount)
    .delete([protect, superAdmin], deleteMount);

module.exports = router;
