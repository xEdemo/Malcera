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
    ],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player', // Reference to players or characters involved
    },
  ],
  religiousOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReligiousOrder', // Reference to the associated religious order
  },
});

const ReligiousEvent = mongoose.model('ReligiousEvent', ReligiousEventSchema);

module.exports = ReligiousEvent;

// tie this in with religious order