const mongoose = require('mongoose');

const BankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  services: {
    type: [String], // Services offered by the bank (e.g., storage, currency exchange)
  },
  currency: {
    type: String,
    required: true,
    default: 'Joss Paper', // The default in-game currency
  },
  vaultCapacity: {
    type: Number,
    required: true,
  },
  securityLevel: {
    type: String,
    required: true,
  },
  openHours: {
    type: String,
    required: true,
    default: '9 AM - 5 PM', // Default opening hours
  },
});

const Bank = mongoose.model('Bank', BankSchema);

module.exports = Bank;
