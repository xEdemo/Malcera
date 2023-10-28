const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    inspectMob,
    createBattleInstance,
    getExistingBattle,
    performActionOnMob,
    fleeFromMob,
} = require('../controllers/battleController.js');

router.route('/inspect/:mobId').get([protect], inspectMob);
router.route('/:mobId').post([protect], createBattleInstance);
router
    .route('/:battleId')
    .get([protect], getExistingBattle)
    .put([protect], performActionOnMob)
    .delete([protect], fleeFromMob);

module.exports = router;
