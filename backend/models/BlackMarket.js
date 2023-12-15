const mongoose = require('mongoose');

const BlackMarketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  goods: {
    type: [String],
    required: true,
  },
  services: {
    type: [String],
  },
  reputation: {
    type: Number,
    default: 0,
  },
  currencyAccepted: {
    type: String,
    required: true,
  },
  owner: {
    type: String,            //mongoose.Schema.Types.ObjectId,
    ref: 'Character', // Reference to an NPC or character that owns the market
  },
  alignment: {
    type: String,
    enum: ['Good', 'Neutral', 'Evil'],
    required: true,
  },
});

const BlackMarket = mongoose.model('BlackMarket', BlackMarketSchema);

module.exports = BlackMarket;

// players can buy rare or illegal items, trade with supernatural beings
// located in different circles of hell with its own theme, goods and services
// alignment of market affects how players are treated and what they can find there,
// will supply related quests such as smuggling or dealing with powerful underworld figures
// offers forbidden goods