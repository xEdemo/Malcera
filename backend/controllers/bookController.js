const { StatusCodes } = require('http-status-codes');
const { Book } = require('../models');

// @desc    Create Book
// @route   POST /api/v1/book
// @access  Private (Super Admin)
const createBook = async (req, res) => {
    const { title, author, genre, content } = req.body;

    if (!title || !author || !genre || !content) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Please fill out all required fields.');
    }

    const book = new Book({
        title,
        author,
        genre,
        content,
    });
    await book.save();
    res.status(StatusCodes.CREATED).json({ book });
};

module.exports = {
    createBook,
};