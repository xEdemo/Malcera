const multer = require("multer");
const express = require("express");
const router = express.Router();

const {
	protect,
	admin,
	superAdmin,
} = require("../middleware/authMiddleware.js");

const { createMap, getAllMaps, getMapByKey } = require("../controllers/mapController.js");

router.route("/").post([protect, superAdmin], createMap).get([protect, superAdmin], getAllMaps);
router.route("/:key").get([protect], getMapByKey);

module.exports = router;
