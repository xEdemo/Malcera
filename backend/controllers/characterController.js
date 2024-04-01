const { User, Character, Item, Inventory } = require("../models");
const { StatusCodes } = require("http-status-codes");

// @desc    Updates Character on Equip
// @route   PUT /api/v1/character/on-equip
// @access  Private
const updateCharacterOnEquip = async (req, res) => {
	const userId = req.user._id.toString();
	const { index } = req.body;

	if (!Number.isInteger(index)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`Index is not a number.`);
	}

	const user = await User.findById(userId);

	if (!user) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`No user found with id ${userId}.`);
	}

	const inventory = await Inventory.findById(user.inventory);
	const character = await Character.findById(user.character);

	const itemToEquip = inventory.slots[index];

	if (!itemToEquip) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(
			`No item found with an id of ${itemToEquip} with index ${index}.`
		);
	}

	// First item in the array for now until it gets specified
	const slotToEquip = itemToEquip.equippableTo[0];
	const itemToInventory = character.equipment[slotToEquip];

	if (itemToEquip.item.toString() === itemToInventory.item.toString()) {
		return res.status(StatusCodes.NOT_MODIFIED);
	}

	inventory.slots[index] = itemToInventory;
	await inventory.save();
	character.equipment[slotToEquip] = itemToEquip;
	await character.save();

	console.log(`New inventory item: ${itemToInventory.name}.`);
	console.log(`New character item: ${itemToEquip.name}.`);

	res.status(StatusCodes.OK).json({ itemToInventory, itemToEquip });
};

// @desc    Grabs Character
// @route   GET /api/v1/character
// @access  Private
const getCharacter = async (req, res) => {
	const userId = req.user._id.toString();
	const user = await User.findById(userId);

	if (!user) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`No user found with id ${userId}.`);
	}

	const character = await Character.findById(user.character);

	res.status(StatusCodes.OK).json({ character });
};

module.exports = {
	updateCharacterOnEquip,
	getCharacter,
};
