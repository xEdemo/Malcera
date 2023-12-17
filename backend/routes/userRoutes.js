const express = require('express');
const router = express.Router();

const { protect, admin, superAdmin } = require('../middleware/authMiddleware.js');

const {
    registerUser,
    authUser,
    logoutUser,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/userController.js');

router.route('/').post(registerUser);
router.route('/auth').post(authUser);
router.route('/logout').post(logoutUser);
router.route('/profile').get([protect], getUser).put([protect], updateUser);
router.route('/:userId').delete([protect, superAdmin], deleteUser);

module.exports = router;