const express = require("express");
const router = express.Router();

const {
	protect,
	admin,
	superAdmin,
} = require("../middleware/authMiddleware.js");

const {
	updateCharacterOnEquip,
	getCharacter,
	unequipOnClick,
} = require("../controllers/characterController.js");

router.route("/").get([protect], getCharacter);
router.route("/on-equip").put([protect], updateCharacterOnEquip);
router.route("/unequip-click").put([protect], unequipOnClick);

module.exports = router;
