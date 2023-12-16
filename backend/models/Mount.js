const mongoose = require('mongoose');

// Define the Mount schema
const MountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure that names are unique
  },
  description: {
    type: String,
    required: true,
  },
  speed: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], // Use enum to restrict values
    required: true,
  }

});

// Create the Mount model
const Mount = mongoose.model('Mount', MountSchema);

module.exports = Mount;


// handles mounts for roonie the retard
// add a tier or rarity system