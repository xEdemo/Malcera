const { Inventory } = require("../models");
const { INVENTORY_SLOTS } = require("../utils/enum.js");

const ensureInventoryForUser = async (userId) => {
	let inv = await Inventory.findOne({ user: userId });
	if (!inv) {
		inv = await Inventory.create({
			user: userId,
			slots: Array.from({ length: INVENTORY_SLOTS }, () => ({
				item: null,
				quantity: 0,
			})),
		});
	} else if (inv.slots.length !== INVENTORY_SLOTS) {
		// normalize length (optional)
		const fixed = inv.slots.slice(0, INVENTORY_SLOTS);
		while (fixed.length < INVENTORY_SLOTS) fixed.push({ item: null, quantity: 0 });
		inv.slots = fixed;
		await inv.save();
	}
	return inv;
};

const findFirstEmptySlotIndex = (slots) => {
	return slots.findIndex((s) => !s.item || s.quantity === 0);
};

const addItemToInventory = (inventory, itemDoc, quantity) => {
	if (quantity <= 0) return;

	const isStackable = !!itemDoc.flags?.stackable;

	if (isStackable) {
		const existingIndex = inventory.slots.findIndex(
			(s) => s.item && s.item.toString() === itemDoc._id.toString()
		);

		if (existingIndex !== -1) {
			inventory.slots[existingIndex].quantity += quantity;
			return;
		}

		const emptyIndex = findFirstEmptySlotIndex(inventory.slots);
		if (emptyIndex === -1) throw new Error("Inventory is full.");
		inventory.slots[emptyIndex] = { item: itemDoc._id, quantity };
		return;
	}

	// non-stackable: needs quantity slots
	for (let i = 0; i < quantity; i++) {
		const emptyIndex = findFirstEmptySlotIndex(inventory.slots);
		if (emptyIndex === -1) throw new Error("Inventory is full.");
		inventory.slots[emptyIndex] = { item: itemDoc._id, quantity: 1 };
	}
};

module.exports = { addItemToInventory, ensureInventoryForUser };
