const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin,
} = require('../middleware/authMiddleware.js');

const {
    createWeather,
    getAllWeathers,
    updateWeather,
    deleteWeather,
} = require('../controllers/weatherController.js');

// Create a new weather
router
    .route('/')
    .post([protect, superAdmin], createWeather)
    .get([protect, admin], getAllWeathers);
router
    .route('/:weatherId')
    .put([protect, superAdmin], updateWeather)
    .delete([protect, superAdmin], deleteWeather);

module.exports = router;
