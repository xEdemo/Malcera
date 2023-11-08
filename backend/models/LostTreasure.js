const mongoose = require('mongoose');

const LostTreasureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});

const LostTreasure = mongoose.model('LostTreasure', LostTreasureSchema);

module.exports = LostTreasure;

// come from treasure maps that need to be deciphered from proficeiency in lost languages
// requires acquirement of lost language proficeiency skills
// quests and adventures from the specific lost languages once the profieueicny is gained, see lsot languages.NPC
// special NPCS with experience in the ancient lost languages
// create secret societies 
// some treasures might require the profieincy of multiple lost languages