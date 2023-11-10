// models/Season.js
const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  startMonth: Number,
  endMonth: Number,
  effects: [String], // Effects of the season (e.g., increased fire damage in Hell's summer)
});

const Season = mongoose.model('Season', seasonSchema);

module.exports = Season;


// handles the season for roonie the retard