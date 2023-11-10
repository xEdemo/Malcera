const mongoose = require('mongoose');

const FloraSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String, // e.g., tree, flower, herb
    required: true,
  },
  description: {
    type: String,
  },
  rarity: {
    type: String, // e.g., common, rare, unique
    required: true,
  },
  properties: {
    type: [String], // e.g., healing, poisonous
  },
});

const Flora = mongoose.model('Flora', FloraSchema);

module.exports = Flora;


// handles the flora for roonie the retard