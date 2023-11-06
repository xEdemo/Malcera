const express = require('express');
const router = express.Router();

const {
    protect,
    admin,
    superAdmin
} = require('../middleware/authMiddleware.js');

const { createBook } = require('../controllers/bookController.js');

router.route('/').post([protect, superAdmin], createBook);
console.log('hi');
module.exports = router;