const mongoose = require('mongoose');

const FaunaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  species: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  behavior: {
    type: String,
  },
  habitat: {
    type: String,
  },
  interactions: {
    type: [String], // e.g., friendly, aggressive
  },
});

const Fauna = mongoose.model('Fauna', FaunaSchema);

module.exports = Fauna;


// handles the fauna for roonie the retard