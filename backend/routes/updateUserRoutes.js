const express = require("express");
const router = express.Router();

const {
	protect,
	admin,
	superAdmin,
} = require("../middleware/authMiddleware.js");

const {
	userPosition
} = require("../controllers/updateUserController.js");

router.route("/position").put([protect], userPosition);

module.exports = router;