const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createMob,
    getAllMobs,
    updateMob,
    deleteMob,
} = require('../controllers/mobController.js');

router
    .route('/')
    .post([protect, superAdmin], createMob)
    .get([protect, admin], getAllMobs);
router
    .route('/:mobId')
    .put([protect, superAdmin], updateMob)
    .delete([protect, superAdmin], deleteMob);

module.exports = router;
