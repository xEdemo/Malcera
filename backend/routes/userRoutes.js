const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware.js');

const {
    registerUser,
    authUser,
    logoutUser,
    getUser,
    updateUser,
} = require('../controllers/userController.js');

router.route('/').post(registerUser);
router.route('/auth').post(authUser);
router.route('/logout').post(logoutUser);
router.route('/profile').get([protect], getUser).put([protect], updateUser);

module.exports = router;
