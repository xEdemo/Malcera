const mongoose = require('mongoose');

const NaturalDisasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Earthquake', 'Tornado', 'Flood', 'Volcanic Eruption', 'Wildfire', 'Hurricane', 'Blizzard', 'Meteor Strike', 'Demonic Invasion', 'Other'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  startTime: {
    type: Date,
    required: false,
  },
  endTime: {
    type: Date,
    required: false,
  },
  affectedAreas: [String],
});

const NaturalDisaster = mongoose.model('NaturalDisaster', NaturalDisasterSchema);

module.exports = NaturalDisaster;


// natural disaster needs to interact with weather somehow