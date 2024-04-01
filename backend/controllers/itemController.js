const { StatusCodes } = require("http-status-codes");
const { Item, Inventory, Character } = require("../models");
const {
	updateInventoryItem,
	updateCharacterItem,
} = require("../utils/updateItem.js");
const {
	replaceInventorySlot,
	replaceCharacterSlot,
} = require("../utils/deleteItem.js");

// @desc    Creates item
// route    POST /api/v1/item
// @access  Private --- Super Admin
const createItem = async (req, res) => {
	const {
		name,
		description,
		image,
		stackable,
		consumable,
		equippable,
		equippableTo,
		healAmount,
		armourRating,
		weaponPower,
	} = req.body;
	if (!name || !description || !image) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`Please fill out all required fields.`);
	}

	if (consumable && !healAmount) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`Give the item a heal amount.`);
	}
    // TODO: Need to handle if array
	if (equippable && (equippableTo === "none" || equippableTo === undefined)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(
			`Make sure to specify equippableTo and to give it a correct value.`
		);
	}

	const item = new Item({
		name,
		description,
		image,
		stackable,
		consumable,
		equippable,
		equippableTo,
		healAmount,
		armourRating,
		weaponPower,
	});
	await item.save();

	res.status(StatusCodes.CREATED).json({ item });
};

// @desc    Grabs all items
// route    GET /api/v1/item
// @access  Private --- Admin
const getAllItems = async (req, res) => {
	const items = await Item.find({}).select("-__v").sort("name");
	res.status(StatusCodes.OK).json({ items });
};

// @desc    Updates an item and updates items in each inventory
// route    PUT /api/v1/item/:itemId
// @access  Private --- Super Admin
const updateItem = async (req, res) => {
	const { itemId } = req.params;
	const {
		name,
		description,
		image,
		stackable,
		consumable,
		equippable,
		equippableTo,
		healAmount,
		armourRating,
		weaponPower,
	} = req.body;

	if (consumable === true) {
		if (!healAmount) {
			res.status(StatusCodes.BAD_REQUEST);
			throw new Error(`Give the item a heal amount.`);
		}
	}

	if (equippable === true) {
		if (!equippableTo) {
			res.status(StatusCodes.BAD_REQUEST);
			throw new Error(
				`Make sure to specify equippableTo and give it a correct value.`
			);
		}
		if (
			equippableTo !== "ammo" &&
			equippableTo !== "mantle" &&
			equippableTo !== "weaponRight" &&
			equippableTo !== "handJewelryRight" &&
			equippableTo !== "helmet" &&
			equippableTo !== "neck" &&
			equippableTo !== "chest" &&
			equippableTo !== "greaves" &&
			equippableTo !== "boots" &&
			equippableTo !== "gauntlets" &&
			equippableTo !== "weaponLeft" &&
			equippableTo !== "handJewelryLeft" &&
            equippableTo === "none"
		) {
            res.status(StatusCodes.BAD_REQUEST);
			throw new Error(
				`Make sure to put in the correct value for equippableTo. You put ${equippableTo}.`
			);
		}
	}

	// Update item in DB
	const item = await Item.findByIdAndUpdate(
		itemId,
		{
			name,
			description,
			image,
			stackable,
			consumable,
			equippable,
			equippableTo,
			healAmount,
			armourRating,
			weaponPower,
		},
		{ new: true }
	);
	if (!item) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error(`No item found with id ${itemId}.`);
	}

	const numberOfInventoriesUpdated = await updateInventoryItem(
		itemId,
		name,
		description,
		image,
		stackable,
		consumable,
		equippable,
		equippableTo,
		healAmount,
		armourRating,
		weaponPower
	);
	const numberOfCharactersUpdated = await updateCharacterItem(
		itemId,
		name,
		description,
		image,
		stackable,
		consumable,
		equippable,
		equippableTo,
		healAmount,
		armourRating,
		weaponPower
	);

	res.status(StatusCodes.OK).json({
		msg: "Item updated.",
		item,
		numberOfInventoriesUpdated,
		numberOfCharactersUpdated,
	});
};

// @desc    Deletes an item
// route    DELETE /api/v1/item/:itemId
// @access  Private --- Super Admin
const deleteItem = async (req, res) => {
	const { itemId } = req.params;
	const emptySlotID = "655ac0ef72adb7c251f09e80";

	// Find "Empty Slot" item
	const emptySlot = await Item.findById(emptySlotID);
	if (!emptySlot) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error("Placeholder item not found.");
	}

	const item = await Item.findByIdAndDelete(itemId);
	if (!item) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error(`No item found with id ${itemId}.`);
	}

	const numberOfInventoriesUpdated = await replaceInventorySlot(
		itemId,
		emptySlot
	);
	const numberOfCharactersUpdated = await replaceCharacterSlot(
		itemId,
		emptySlot
	);

	res.status(StatusCodes.OK).json({
		msg: "Item deleted",
		item,
		numberOfInventoriesUpdated,
		numberOfCharactersUpdated,
	});
};

module.exports = { createItem, getAllItems, updateItem, deleteItem };
