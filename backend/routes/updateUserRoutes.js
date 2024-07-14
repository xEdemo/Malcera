const express = require("express");
const router = express.Router();

const {
	protect,
	admin,
	superAdmin,
} = require("../middleware/authMiddleware.js");

const {
	userPosition,
	getUserPosition,
} = require("../controllers/updateUserController.js");

router
	.route("/position")
	.put([protect], userPosition)
	.get([protect], getUserPosition);

module.exports = router;