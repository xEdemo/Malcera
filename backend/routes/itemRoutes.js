const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createItem,
    getAllItems,
    updateItem,
    deleteItem,
} = require('../controllers/itemController.js');

router
    .route('/')
    .post([protect, superAdmin], createItem)
    .get([protect, admin], getAllItems);
router
    .route('/:itemId')
    .put([protect, superAdmin], updateItem)
    .delete([protect, superAdmin], deleteItem);

module.exports = router;
