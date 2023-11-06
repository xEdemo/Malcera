const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createNpc,
    getAllNpcs,
    updateNpc,
    deleteNpc,
} = require('../controllers/npcController.js');

router
    .route('/')
    .post([protect, superAdmin], createNpc)
    .get([protect, admin], getAllNpcs);
router
    .route('/:npcId')
    .put([protect, superAdmin], updateNpc)
    .delete([protect, superAdmin], deleteNpc);

module.exports = router;