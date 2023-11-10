const mongoose = require('mongoose');

// Define a schema for Sentient Items
const SentientItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  abilities: {
    type: [String], // An array of abilities the item can grant to the wielder
  },
  alignment: {
    type: String, // Alignment of the item (e.g., Good, Evil, Neutral)
  },
  personality: {
    type: String, // The item's personality traits
  },
  history: {
    type: String, // The backstory and history of the item
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the character who owns the item
    ref: 'User', // Reference the User model
  },
});

// Create a model for Sentient Items
const SentientItem = mongoose.model('SentientItem', SentientItemSchema);

module.exports = SentientItem;

// scattered throughout the game world 
// grants certain powers
// come with their own personality
// some are negative or positive aligned and can only be achieved by a certain XP in the moral alignment
// somehow figure out a variable for that ^^^^^^^^
// talking sentient items