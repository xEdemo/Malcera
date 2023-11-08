const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin
} = require('../middleware/authMiddleware.js');

const { createBook, getBookById } = require('../controllers/bookController.js');

router.route('/').post([protect, superAdmin], createBook).get([protect, superAdmin], getBookById).get([protect, superAdmin], getBookById);
console.log("fuckem all")
module.exports = router;