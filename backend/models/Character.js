const mongoose = require("mongoose");

const CharacterSlotSchema = new mongoose.Schema(
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
		// },
	},
	{ _id: false }
);

const CharacterSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		equipment: {
			helmet: { type: CharacterSlotSchema, default: () => ({}) },
			neck: { type: CharacterSlotSchema, default: () => ({}) },
			chest: { type: CharacterSlotSchema, default: () => ({}) },
			greaves: { type: CharacterSlotSchema, default: () => ({}) },
			boots: { type: CharacterSlotSchema, default: () => ({}) },
			gauntlets: { type: CharacterSlotSchema, default: () => ({}) },
			weaponRight: { type: CharacterSlotSchema, default: () => ({}) },
			weaponLeft: { type: CharacterSlotSchema, default: () => ({}) },
			handJewelryRight: {
				type: CharacterSlotSchema,
				default: () => ({}),
			},
			handJewelryLeft: { type: CharacterSlotSchema, default: () => ({}) },
			mantle: { type: CharacterSlotSchema, default: () => ({}) },
			ammo: { type: CharacterSlotSchema, default: () => ({}) },
		},
	},
	{ timestamps: true }
);

const Character = mongoose.model("Character", CharacterSchema);

module.exports = Character;
