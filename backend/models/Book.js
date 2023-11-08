const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  author: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const Book = mongoose.model('Book', BookSchema);

module.exports = Book;

//manages and stores info related to books within the game world
// provie lore, guests hints and buncha shit
// can find hitten items within books
// collecting sets of books can grant unique rewards, 
// rare or coveted books can be a status symbol among players
// add tier variable to this class
// steves gay rly gay