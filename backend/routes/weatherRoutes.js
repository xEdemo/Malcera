const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Create a new weather condition
router.post('/', weatherController.createWeather);

// Get all weather conditions
router.get('/', weatherController.getAllWeather);

// Get a specific weather condition by ID
router.get('/:weatherId', weatherController.getWeatherById);

// Update a specific weather condition by ID
router.put('/:weatherId', weatherController.updateWeather);

// Delete a specific weather condition by ID
router.delete('/:weatherId', weatherController.deleteWeather);

// Add more routes or functionalities as needed

module.exports = router;
