const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createReligiousOrder,
    getAllReligiousOrders,
    updateReligiousOrder,
    deleteReligiousOrder,
} = require('../controllers/religiousOrderController.js');

// Create a new religiousOrder
router
    .route('/')
    .post([protect, superAdmin], createReligiousOrder)
    .get([protect, admin], getAllReligiousOrders);
router
    .route('/:religiousOrderId')
    .put([protect, superAdmin], updateReligiousOrder)
    .delete([protect, superAdmin], deleteReligiousOrder);

module.exports = router;
