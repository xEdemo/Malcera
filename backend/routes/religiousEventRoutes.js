const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createReligiousEvent,
    getAllReligiousEvents,
    updateReligiousEvent,
    deleteReligiousEvent,
} = require('../controllers/religiousEventController.js');

// Create a new religiousEvent
router
    .route('/')
    .post([protect, superAdmin], createReligiousEvent)
    .get([protect, admin], getAllReligiousEvents);
router
    .route('/:religiousEventId')
    .put([protect, superAdmin], updateReligiousEvent)
    .delete([protect, superAdmin], deleteReligiousEvent);


module.exports = router;
