const DayNight = require('../models/DayNight');

// Controller for handling the day and night cycle
const dayNightController = {
  // Get the current day and night information
  getCurrentDayNight: async (req, res) => {
    try {
      // Logic to determine the current day and night cycle based on the time in your game world
      // You may need to implement custom logic to update "isDay" based on your game's time system

      // Retrieve the current day and night information from the database
      const dayNight = await DayNight.findOne();

      if (!dayNight) {
        return res.status(404).json({ error: 'DayNight information not found.' });
      }

      return res.json(dayNight);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while fetching day and night information.' });
    }
  },

  // Update the day and night cycle information
  updateDayNight: async (req, res) => {
    try {
      const updatedDayNight = await DayNight.findByIdAndUpdate(req.params.id, req.body, { new: true });

      if (!updatedDayNight) {
        return res.status(404).json({ error: 'DayNight information not found.' });
      }

      return res.json(updatedDayNight);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while updating day and night information.' });
    }
  },
};

module.exports = dayNightController;
