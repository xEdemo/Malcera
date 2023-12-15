const mongoose = require('mongoose');

const ReligiousEventSchema = new mongoose.Schema({
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
    enum: [
      'Pilgrimage',
      'Religious Festival',
      'Crusade',
      'Spiritual Retreat',
      'Religious Conference',
      'Holy War', 
    ],              // add second type ex crusade
    required: true,
  },
  date: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: true,
  },
  participants: [
    {
      type: Number,
      ref: 'User', // Reference to players or characters involved
    },
  ],
  religiousOrder: {
    type: Number,
    ref: 'ReligiousOrder', // Reference to the associated religious order
  },
});

const ReligiousEvent = mongoose.model('ReligiousEvent', ReligiousEventSchema);

module.exports = ReligiousEvent;

// tie this in with religious order
