const mongoose = require('mongoose');

// Define the Season schema
const SeasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure that names are unique
  },
  description: {
    type: String,
    required: true,
  },
  startMonth: {
    type: Number,
    required: true,
  },
  endMonth: {
    type: Number,
    required: true,
  },
  effects: String,

});

// Create the Season model
const Season = mongoose.model('Season', SeasonSchema);

module.exports = Season;


// handles seasons for roonie the retard