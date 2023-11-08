const mongoose = require('mongoose');

const DayNightSchema = new mongoose.Schema({
  isDay: {
    type: Boolean,
    default: true, // Set to true to represent daytime
  },
  startTime: {
    type: String, // You can use a string to represent the time (e.g., "08:00 AM")
    required: true,
  },
  endTime: {
    type: String, // You can use a string to represent the time (e.g., "08:00 PM")
    required: true,
  },
  cycleDuration: {
    type: Number, // Duration of a full day-night cycle in milliseconds
    required: true,
  },
});

const DayNight = mongoose.model('DayNight', DayNightSchema);

module.exports = DayNight;

// handles day and night for roonie the retard
