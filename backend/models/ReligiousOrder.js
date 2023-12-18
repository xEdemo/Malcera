const mongoose = require('mongoose');

const ReligiousOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  deity: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  alignment: {
    type: String,
    required: true,
  },
  members: [{
    type: String,            //mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  headquarters: {
    type: String,
    required: true,
  },
  temples: [{
    type: String,                  //mongoose.Schema.Types.ObjectId,
    ref: 'Temple',
  }],
  rivals: [{
    type: String,                  //mongoose.Schema.Types.ObjectId,
    ref: 'ReligiousOrder',
  }],
  alliances: [{
    type: String,                  //mongoose.Schema.Types.ObjectId,
    ref: 'ReligiousOrder',
  }],
  leader: {
    type: String,                    //mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const ReligiousOrder = mongoose.model('ReligiousOrder', ReligiousOrderSchema);

module.exports = ReligiousOrder;


// creates rich lore and background
// defines their beleifs practices hsitory and role in the world
// players can join these orders as part of the charcater sbackstory
// quests and missions can be associated per religious order
//each order will have its own religious artifacts or relics, can grant items with special powers or pieces of the storyline
// involves places of worship CALLED TEMPLES which offer different thigns
// each order has rivalries and alliances with other orders
// orders could compete for influence and control - advanced
//
