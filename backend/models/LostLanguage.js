const mongoose = require('mongoose');

// Define a schema for Lost Languages
const LostLanguageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  symbols: [String], // An array of symbols in the language
  difficulty: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    default: 'basic',
  },
  // Other properties to describe the language, its history, and usage
});

// Create a model for Lost Languages
const LostLanguage = mongoose.model('LostLanguage', LostLanguageSchema);

module.exports = LostLanguage;


// players can come across ancient manuscripts or books written in a lost language
// these texts can be found in hidden or remot elocations or dungeons / quests
// as plaeyrsa advance their understanding of the lost language they gain proficiency skills - need proficiency system for languages
// need a deciphering mechanism could be learning from NPCs and puzzle matching words
// lost langtuages can be from quests or provide quests once language is fulyl deciphered
// found in hidden off the map locations
// players who become proificient gain unique abilities or access to special exclusive things tied to the languages lore