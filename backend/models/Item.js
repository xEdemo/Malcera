const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		stackable: {
			type: Boolean,
			default: false,
		},
		consumable: {
			type: Boolean,
			default: false,
		},
		equippable: {
			type: Boolean,
			default: false,
		},
		equippableTo: {
			type: [String],
			enum: [
				"none",
				"ammo",
				"mantle",
				"weaponRight",
				"handJewelryRight",
				"helmet",
				"neck",
				"chest",
				"greaves",
				"boots",
				"gauntlets",
				"weaponLeft",
				"handJewelryLeft",
			],
			default: "none",
		},
		healAmount: {
			type: Number,
		},
		armourRating: {
			type: Number,
		},
		weaponPower: {
			type: Number,
		},
	},
	{ timestamps: true }
);

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
