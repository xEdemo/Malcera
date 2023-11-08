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

// @desc    Get all Books
// @route   GET /api/v1/book
// @access  Private (Admin)
const getAllBooks = async (req, res) => {
    const books = await Book.find({});
    res.status(StatusCodes.OK).json({ count: books.length, books });
};

// @desc    Get Book by ID
// @route   GET /api/v1/book/:bookId
// @access  Private (Admin)
const getBookById = async (req, res) => {
    const bookId = req.params.bookId;
    const book = await Book.findById(bookId);
    if (!book) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`Book with ID ${bookId} not found.`);
    }
    res.status(StatusCodes.OK).json({ book });
};

// @desc    Update Book
// @route   PUT /api/v1/book/:bookId
// @access  Private (Super Admin)
const updateBook = async (req, res) => {
    const bookId = req.params.bookId;
    const { title, author, genre, content } = req.body;

    const filter = { _id: bookId };
    const updatedBook = await Book.findOneAndUpdate(
        filter,
        { title, author, genre, content },
        { new: true }
    );

    if (!updatedBook) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No book found with an ID of ${bookId}.`);
    }

    res.status(StatusCodes.OK).json({ updatedBook });
};

// @desc    Delete Book
// @route   DELETE /api/v1/book/:bookId
// @access  Private (Super Admin)
const deleteBook = async (req, res) => {
    const bookId = req.params.bookId;
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No book found with an ID of ${bookId}.`);
    }

    res.status(StatusCodes.OK).json({ message: 'Book deleted successfully.' });
};

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
};
