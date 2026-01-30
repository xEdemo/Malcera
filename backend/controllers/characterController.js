const asyncHandler = require("express-async-handler");
const { User, Character, Inventory, Item } = require("../models");
const { StatusCodes } = require("http-status-codes");
const { EQUIP_SLOTS, INVENTORY_SLOTS } = require("../utils/enum.js");

// ---------- helpers ----------
const isValidIndex = (n) =>
	Number.isInteger(n) && n >= 0 && n < INVENTORY_SLOTS;

const isEmptySlot = (slot) => !slot?.item || slot.quantity <= 0;

const makeEmptySlot = () => ({ item: null, quantity: 0 });

const normalizeQtyForNonStackable = (qty) => {
	// Non-stackables should always be 1 when present.
	if (!Number.isFinite(qty) || qty <= 0) return 1;
	return 1;
};

const findFirstEmptySlotIndex = (slots) => {
	return slots.findIndex((s) => isEmptySlot(s));
};

const findFirstStackIndex = (slots, itemId) =>
	slots.findIndex(
		(s) =>
			s.item && s.item.toString() === itemId.toString() && s.quantity > 0
	);

// Build populate paths for equipment.*.item
const buildEquipmentPopulate = () =>
	EQUIP_SLOTS.map((slot) => ({
		path: `equipment.${slot}.item`,
		select: "key name description image flags equip consumable weapon armour",
	}));

// ---------- controllers ----------

// @desc    Updates character on equip (swap inventory slot <-> equipment slot)
// @route   PUT /api/v1/character/on-equip
// @access  Private
const updateCharacterOnEquip = asyncHandler(async (req, res) => {
	const userId = req?.user?._id?.toString();
	const { index } = req.body;

	if (!isValidIndex(index)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Index is invalid.");
	}

	const user = await User.findById(userId);
	if (!user) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`No user found with id ${userId}.`);
	}

	const [inventory, character] = await Promise.all([
		Inventory.findById(user.inventory),
		Character.findById(user.character),
	]);

	if (!inventory) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error("Inventory not found.");
	}
	if (!character) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error("Character not found.");
	}

	const invSlot = inventory.slots[index];
	if (isEmptySlot(invSlot)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("No item in that inventory slot.");
	}

	const itemDoc = await Item.findById(invSlot.item).select(
		"flags equip key name"
	);
	if (!itemDoc) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error("Item document not found.");
	}

	// validate equippable
	if (!itemDoc.flags?.equippable) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("That item is not equippable.");
	}

	const slotToEquip = itemDoc.equip?.slot;
	if (!slotToEquip || !EQUIP_SLOTS.includes(slotToEquip)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Item has no valid equip.slot.");
	}

	// current equipped slot
	const equippedSlot = character.equipment?.[slotToEquip] || makeEmptySlot();

	const isStackable = !!itemDoc.flags?.stackable;

	// sanitize quantities
	const invQty = Math.max(0, Number(invSlot.quantity || 0));
	if (invQty <= 0) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Inventory slot quantity is invalid.");
	}

	// If non-stackable, enforce inv qty = 1
	const invQtyEffective = isStackable
		? invQty
		: normalizeQtyForNonStackable(invQty);

	// CASE 1: slot already has same item AND stackable => add quantities
	if (
		isStackable &&
		equippedSlot.item &&
		equippedSlot.item.toString() === itemDoc._id.toString() &&
		equippedSlot.quantity > 0
	) {
		character.equipment[slotToEquip].quantity =
			Number(character.equipment[slotToEquip].quantity || 0) +
			invQtyEffective;

		// clear inventory slot
		inventory.slots[index] = { item: null, quantity: 0 };

		await Promise.all([inventory.save(), character.save()]);

		const populatedCharacter = await Character.findById(
			user.character
		).populate(buildEquipmentPopulate());

		return res.status(StatusCodes.OK).json({
			msg: "Stacked equipped item.",
			inventory,
			character: populatedCharacter,
		});
	}

	// CASE 2: otherwise swap
	const nextEquipped = { item: invSlot.item, quantity: invQtyEffective };
	const nextInventorySlot = {
		item: equippedSlot.item || null,
		quantity: Math.max(0, Number(equippedSlot.quantity || 0)),
	};

	// If we swapped out a non-stackable item, force it to 1 in inventory
	// Most of non-stackables will already be qty=1
	if (nextInventorySlot.item && nextInventorySlot.quantity <= 0) {
		// if equipped slot had item but qty 0, treat as empty
		nextInventorySlot.item = null;
		nextInventorySlot.quantity = 0;
	}

	// write swap
	character.equipment[slotToEquip] = nextEquipped;
	inventory.slots[index] = nextInventorySlot;

	await Promise.all([inventory.save(), character.save()]);

	const populatedCharacter = await Character.findById(
		user.character
	).populate(buildEquipmentPopulate());

	res.status(StatusCodes.OK).json({
		msg: "Equipped (swap).",
		inventory,
		character: populatedCharacter,
	});
});

// @desc    Grabs character (populated equipment items)
// @route   GET /api/v1/character
// @access  Private
const getCharacter = asyncHandler(async (req, res) => {
	const userId = req?.user?._id?.toString();
	const user = await User.findById(userId);

	if (!user) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`No user found with id ${userId}.`);
	}

	const character = await Character.findById(user.character).populate(
		buildEquipmentPopulate()
	);

	if (!character) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error("Character not found.");
	}

	res.status(StatusCodes.OK).json({ character });
});

// @desc    Equip from inventory index (swap / stack-aware)
// @route   PUT /api/v1/character/unequip-click
// @access  Private
const unequipOnClick = asyncHandler(async (req, res) => {
	const userId = req?.user?._id?.toString();
	const { slot } = req.body;

	if (!slot || typeof slot !== "string") {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`Invalid slot: ${slot}`);
	}

	const user = await User.findById(userId).select("inventory character");
	if (!user) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`No user found with id ${userId}.`);
	}

	const [inventory, character] = await Promise.all([
		Inventory.findById(user.inventory),
		Character.findById(user.character),
	]);

	if (!inventory) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error("Inventory not found.");
	}
	if (!character) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error("Character not found.");
	}

	const equipSlot = character.equipment?.[slot];
	if (!equipSlot || isEmptySlot(equipSlot)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Nothing is equipped in that slot.");
	}

	const itemDoc = await Item.findById(equipSlot.item).select("flags");
	if (!itemDoc) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Equipped item no longer exists.");
	}

	const isStackable = !!itemDoc.flags?.stackable;
	const qtyToMove = equipSlot.quantity || (isStackable ? 0 : 1);

	if (isStackable) {
		// IMPORTANT: even if there are empty slots, prefer stacking first
		const stackIndex = findFirstStackIndex(inventory.slots, equipSlot.item);

		if (stackIndex !== -1) {
			inventory.slots[stackIndex].quantity += qtyToMove;
			character.equipment[slot] = makeEmptySlot();

			await Promise.all([inventory.save(), character.save()]);

			return res.status(StatusCodes.OK).json({
				msg: "Unequipped and stacked into existing inventory stack.",
				stackIndex,
			});
		}

		// No existing stack -> require empty slot
		const emptyIndex = findFirstEmptySlotIndex(inventory.slots);
		if (emptyIndex === -1) {
			res.status(StatusCodes.BAD_REQUEST);
			throw new Error(
				"Inventory is full. Cannot unequip stackable item."
			);
		}

		inventory.slots[emptyIndex] = {
			item: equipSlot.item,
			quantity: qtyToMove,
		};
		character.equipment[slot] = makeEmptySlot();

		await Promise.all([inventory.save(), character.save()]);

		return res.status(StatusCodes.OK).json({
			msg: "Unequipped into empty slot.",
			emptyIndex,
		});
	}

	// Non-stackable: require empty slot
	const emptyIndex = findFirstEmptySlotIndex(inventory.slots);
	if (emptyIndex === -1) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Inventory is full. Cannot unequip item.");
	}

	inventory.slots[emptyIndex] = { item: equipSlot.item, quantity: 1 };
	character.equipment[slot] = makeEmptySlot();

	await Promise.all([inventory.save(), character.save()]);

	res.status(StatusCodes.OK).json({
		msg: "Unequipped into empty slot.",
		emptyIndex,
	});
});

module.exports = {
	updateCharacterOnEquip,
	getCharacter,
	unequipOnClick,
};
