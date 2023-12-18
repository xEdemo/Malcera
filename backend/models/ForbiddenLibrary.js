const mongoose = require('mongoose');

// Define a schema for Forbidden Libraries
const ForbiddenLibrarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
  },
  guardian: {
    type: String,
  },
  contents: {
    type: String, // An array of forbidden tomes or texts
  },
  questRequired: {
    type: String, // Quest or condition required to access the library
  },
  moralAlignment: {
    type: String, // Moral alignment impact for accessing the library
  },
});

// Create a model for Forbidden Libraries
const ForbiddenLibrary = mongoose.model('ForbiddenLibrary', ForbiddenLibrarySchema);

module.exports = ForbiddenLibrary;

// libraries in remote and cryptic locations, may be hidden in deoslate islands, underground catacombs and cryptic palces
// have guardians defending them, powerful entities opr creatures
// puyzzles needed to enter
// house vast collection of texts which could help with gaining unique skills or spells
// adds a depth aspect to lore
// could have quests and missions related to these
// moral choices, accessing forbidden knowledge may grant pwoers but at a coST TO a players moral alignment
// need an antonym  for the good people - library wise and also basic libraries
// will be good for the trade and barter system on the black market