const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  effects: {
    type: String, // You can customize this based on your needs
    required: true,
  },
  // Add more attributes as needed
});

module.exports = mongoose.model('Weather', WeatherSchema);


// handles the weather for steven aka roonie the retard 
