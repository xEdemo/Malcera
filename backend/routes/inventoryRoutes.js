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
    combineStackableItems,
} = require('../controllers/inventoryController.js');

router.route('/').get([protect], getInventory);
router.route('/on-drop').put([protect], updateInventoryOnDrop);
router.route('/combine').put([protect], combineStackableItems);

module.exports = router;