const mongoose = require('mongoose');

const TempleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  deity: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  clergy: [{
    type:  String,         //mongoose.Schema.Types.ObjectId,
    ref: 'Npc', // Reference to NPC characters belonging to the religious order
  }],
  services: {
    type: [String], // List of services provided in the temple
  },
});

const Temple = mongoose.model('Temple', TempleSchema);

module.exports = Temple;

// tied to religious order
