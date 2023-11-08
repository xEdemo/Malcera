const Weather = require('../models/Weather');

// Controller methods for weather management
const createWeather = async (req, res) => {
  try {
    const weather = await Weather.create(req.body);
    return res.status(201).json(weather);
  } catch (error) {
    return res.status(500).json({ error: 'Unable to create weather condition.' });
  }
};

const getAllWeather = async (req, res) => {
  try {
    const weather = await Weather.find();
    return res.json(weather);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching weather conditions.' });
  }
};

const getWeatherById = async (req, res) => {
  const { weatherId } = req.params;
  try {
    const weather = await Weather.findById(weatherId);
    if (!weather) {
      return res.status(404).json({ error: 'Weather condition not found.' });
    }
    return res.json(weather);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching weather condition.' });
  }
};

const updateWeather = async (req, res) => {
  const { weatherId } = req.params;
  try {
    const updatedWeather = await Weather.findByIdAndUpdate(weatherId, req.body, { new: true });
    if (!updatedWeather) {
      return res.status(404).json({ error: 'Weather condition not found.' });
    }
    return res.json(updatedWeather);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating weather condition.' });
  }
};

const deleteWeather = async (req, res) => {
  const { weatherId } = req.params;
  try {
    const deletedWeather = await Weather.findByIdAndRemove(weatherId);
    if (!deletedWeather) {
      return res.status(404).json({ error: 'Weather condition not found.' });
    }
    return res.json(deletedWeather);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting weather condition.' });
  }
};

// Add more controller methods or functionalities as needed

module.exports = {
  createWeather,
  getAllWeather,
  getWeatherById,
  updateWeather,
  deleteWeather,
  // Add more controller methods as needed
};
