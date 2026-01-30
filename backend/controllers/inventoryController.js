const asyncHandler = require("express-async-handler");
const { Inventory, User, Item } = require("../models");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const { INVENTORY_SLOTS } = require("../utils/enum.js");

// ---------- helpers ----------
const isValidIndex = (i) =>
	Number.isInteger(i) && i >= 0 && i < INVENTORY_SLOTS;

const toObjectIdOrNull = (v) => {
	if (v === null || v === undefined || v === "") return null;

	// If slot.item is populated, accept item._id
	if (typeof v === "object" && v._id) v = v._id;

	if (v instanceof mongoose.Types.ObjectId) return v;

	if (typeof v === "string" && mongoose.isValidObjectId(v)) {
		return new mongoose.Types.ObjectId(v);
	}

	return null;
};

const toSafeQty = (v) => {
	if (v === null || v === undefined || v === "") return 0;

	// accept numbers or numeric strings
	const n = Number(v);
	if (!Number.isFinite(n)) return 0;

	return Math.max(0, Math.floor(n));
};

const sanitizeSlot = (raw) => {
	const item = toObjectIdOrNull(raw?.item);

	// accept both quantity and qty (client may still send qty)
	const quantity = toSafeQty(raw?.quantity ?? raw?.qty);

	// empty if no item OR non-positive qty
	if (!item || quantity <= 0) return { item: null, quantity: 0 };

	return { item, quantity };
};

const isEmptySlot = (slot) => !slot?.item || slot.quantity <= 0;

const findFirstEmptySlotIndex = (slots) =>
	slots.findIndex((s) => isEmptySlot(s));

const ensureUserAndInventory = async (userId) => {
	const user = await User.findById(userId);
	if (!user) {
		const err = new Error(`No user found with id ${userId}.`);
		err.statusCode = StatusCodes.BAD_REQUEST;
		throw err;
	}

	let inventory = null;
	if (user.inventory) inventory = await Inventory.findById(user.inventory);

	if (!inventory) {
		// fallback if user.inventory missing
		inventory = await Inventory.findOne({ user: userId });
	}

	if (!inventory) {
		const err = new Error("Inventory not found for user.");
		err.statusCode = StatusCodes.BAD_REQUEST;
		throw err;
	}

	// normalize length
	if (!Array.isArray(inventory.slots)) inventory.slots = [];
	if (inventory.slots.length !== INVENTORY_SLOTS) {
		const fixed = inventory.slots
			.slice(0, INVENTORY_SLOTS)
			.map((s) => sanitizeSlot(s));
		while (fixed.length < INVENTORY_SLOTS)
			fixed.push({ item: null, quantity: 0 });
		inventory.slots = fixed;
		await inventory.save();
	}

	return { user, inventory };
};

// ---------- controllers ----------

// @desc    Updates Inventory on Drag (partial patch by indices)
// @route   PUT /api/v1/inventory/on-drop
// @access  Private
const updateInventoryOnDrop = asyncHandler(async (req, res) => {
	const userId = req?.user?._id?.toString();
	const fromIndex = Number(req.body.fromIndex);
	const toIndex = Number(req.body.toIndex);

	if (!isValidIndex(fromIndex) || !isValidIndex(toIndex)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Invalid indices.");
	}

	if (fromIndex === toIndex) {
		const { inventory } = await ensureUserAndInventory(userId);
		return res.status(StatusCodes.OK).json({ inventory });
	}

	const { inventory } = await ensureUserAndInventory(userId);

	// swap
	const temp = inventory.slots[fromIndex];
	inventory.slots[fromIndex] = inventory.slots[toIndex];
	inventory.slots[toIndex] = temp;

	await inventory.save();

	res.status(StatusCodes.OK).json({ inventory });
});

// @desc    Grabs items from inventory for users
// @route   GET /api/v1/inventory
// @access  Private
const getInventory = asyncHandler(async (req, res) => {
	const userId = req?.user?._id?.toString();
	const { inventory } = await ensureUserAndInventory(userId);

	// Optional but usually helpful for UI:
	// Populate the item doc referenced by each slot.
	await inventory.populate({
		path: "slots.item",
		select: "key name description image flags equip consumable weapon armour",
	});

	res.status(StatusCodes.OK).json({ inventory });
});

// @desc    Splits a stackable item
// @route   PUT /api/v1/inventory/split
// @access  Private
const splitStackableItem = asyncHandler(async (req, res) => {
	const userId = req?.user?._id?.toString();
	const index = Number(req.body.index);
	const amount = Number(req.body.amount);

	if (!isValidIndex(index)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Index is invalid.");
	}
	if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Please enter a valid whole number greater than zero.");
	}

	const { inventory } = await ensureUserAndInventory(userId);

	const slot = inventory.slots[index];
	if (!slot?.item || slot.quantity <= 1) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Cannot split: slot is empty or quantity <= 1.");
	}

	// check stackable from Item doc
	const itemDoc = await Item.findById(slot.item).select("flags.stackable");
	if (!itemDoc) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Item in slot no longer exists.");
	}
	if (!itemDoc.flags?.stackable) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("This item is not stackable, so it cannot be split.");
	}

	if (amount >= slot.quantity) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Split amount must be less than the slot quantity.");
	}

	const emptyIndex = findFirstEmptySlotIndex(inventory.slots);
	if (emptyIndex === -1) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("No empty slot found.");
	}

	// move amount into empty slot, reduce original
	inventory.slots[emptyIndex] = { item: slot.item, quantity: amount };
	inventory.slots[index].quantity = slot.quantity - amount;

	await inventory.save();

	res.status(StatusCodes.OK).json({ inventory });
});

// @desc    Combines Items on Drag (drag one stack onto another)
// @route   PUT /api/v1/inventory/combine
// @access  Private
const combineStackableItems = asyncHandler(async (req, res) => {
	const userId = req?.user?._id?.toString();
	const fromIndex = Number(req.body.fromIndex);
	const toIndex = Number(req.body.toIndex);

	if (!isValidIndex(fromIndex) || !isValidIndex(toIndex)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Invalid indices for combine.");
	}
	if (fromIndex === toIndex) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Cannot combine a slot into itself.");
	}

	const { inventory } = await ensureUserAndInventory(userId);

	const from = inventory.slots[fromIndex];
	const to = inventory.slots[toIndex];

	if (isEmptySlot(from) || isEmptySlot(to)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Both slots must contain an item to combine.");
	}

	if (from.item.toString() !== to.item.toString()) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Items do not match (different item ids).");
	}

	const itemDoc = await Item.findById(from.item).select("flags.stackable");
	if (!itemDoc) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Item no longer exists.");
	}
	if (!itemDoc.flags?.stackable) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Item is not stackable.");
	}

	// combine quantities
	inventory.slots[toIndex].quantity += from.quantity;

	// clear from slot
	inventory.slots[fromIndex] = { item: null, quantity: 0 };

	await inventory.save();

	res.status(StatusCodes.OK).json({ inventory });
});

// @desc    Removes an item from inventory
// @route   PUT /api/v1/inventory/remove
// @access  Private
const removeItem = asyncHandler(async (req, res) => {
	const userId = req?.user?._id?.toString();
	const index = Number(req.body.index);

	if (!isValidIndex(index)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Index is invalid.");
	}

	const { inventory } = await ensureUserAndInventory(userId);

	inventory.slots[index] = { item: null, quantity: 0 };
	await inventory.save();

	res.status(StatusCodes.OK).json({
		msg: "Item removed.",
		inventory,
	});
});

module.exports = {
	updateInventoryOnDrop,
	getInventory,
	splitStackableItem,
	combineStackableItems,
	removeItem,
};
