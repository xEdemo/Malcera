const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createDemonicContract,
    getAllDemonicContracts,
    updateDemonicContract,
    deleteDemonicContract,
} = require('../controllers/demonicContractController.js');

// Create a new DemonicContract
router
    .route('/')
    .post([protect, superAdmin], createDemonicContract)
    .get([protect, admin], getAllDemonicContracts);
router
    .route('/:demonicContractId')
    .put([protect, superAdmin], updateDemonicContract)
    .delete([protect, superAdmin], deleteDemonicContract);

module.exports = router;