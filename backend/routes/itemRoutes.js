const multer = require("multer");
const express = require("express");
const router = express.Router();

const {
	protect,
	admin,
	superAdmin,
} = require("../middleware/authMiddleware.js");

const {
	createItem,
	getAllItems,
	updateItem,
	deleteItem,
} = require("../controllers/itemController.js");

// Configure Multer (store image in memory first)
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
	},
});

router
	.route("/")
	.post([protect, superAdmin, upload.single("image")], createItem)
	.get([protect, admin], getAllItems);
router
	.route("/:itemId")
	.put([protect, superAdmin, upload.single("image")], updateItem)
	.delete([protect, superAdmin], deleteItem);

module.exports = router;
