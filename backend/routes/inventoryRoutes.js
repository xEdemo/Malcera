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
    splitStackableItem,
    combineStackableItems,
    removeItem,
} = require('../controllers/inventoryController.js');

router.route('/').get([protect], getInventory);
router.route('/on-drop').put([protect], updateInventoryOnDrop);
router.route('/split').put([protect], splitStackableItem);
router.route('/combine').put([protect], combineStackableItems);
router.route('/remove').put([protect], removeItem);

module.exports = router;