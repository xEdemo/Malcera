const mongoose = require('mongoose');

const DemonicContractSchema = new mongoose.Schema({
  contractName: {
    type: String,
    required: true,
    unique: true,
  },
  demonEntity: {
    type: String,
    required: true,
  },
  terms: {
    type: String,
    required: true,
  },
  cost: {
    type: String,
    required: true,
  },
  consequences: {
    type: String,
    required: true,
  },
  holder: {
    type: String,                      //mongoose.Schema.Types.ObjectId,
    required: true,                     //'Player', // Reference to the player who holds the contract
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const DemonicContract = mongoose.model('DemonicContract', DemonicContractSchema);

module.exports = DemonicContract;

// allows players to form pacts with demons gaining unique abilities not available in regular playthrough, at the cost of certian consequences
// introduces moral dillemmas may sacxrifice health, moral alignment or the well being of NPCS
//some quests could involve demonic contracts and may only be avaialble for evil morally aligned players
// can help shape the plaeyrs character develiopment in his moral alignment
//can introduce plot twists a contracts expiration, consequences or a demons changing intentions- they arent the most trustworthy
//