const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    updateInventoryOnDrop,
    getInventory,
} = require('../controllers/inventoryController.js');

router.route('/').get([protect], getInventory);
router.route('/on-drop').put([protect], updateInventoryOnDrop);

module.exports = router;