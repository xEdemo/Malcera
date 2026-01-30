const mongoose = require("mongoose");
const { INVENTORY_SLOTS } = require("../utils/enum.js");

const InventorySlotSchema = new mongoose.Schema(
	{
		item: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Item",
			default: null,
		},
		quantity: {
			type: Number,
			default: 0,
			min: 0,
		},

		// Per-instance/per-slot metadata
		// meta: {
		// 	durability: { type: Number, min: 0 },
		// 	// rolledStats: { ... } etc.
		// 	bound: { type: Boolean, default: false },
		// },
	},
	{ _id: false }
);

const InventorySchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		slots: {
			type: [InventorySlotSchema],
			default: () =>
				Array.from({ length: INVENTORY_SLOTS }, () => ({ item: null, quantity: 0 })),
			validate: [
				(slots) => slots.length === INVENTORY_SLOTS,
				`Inventory must have exactly ${INVENTORY_SLOTS} slots.`,
			],
		},
	},
	{ timestamps: true }
);

const Inventory = mongoose.model("Inventory", InventorySchema);

module.exports = Inventory;
