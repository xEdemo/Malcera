const mongoose = require('mongoose');

const InventorySlotSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
        },
        name: {
            type: String,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
        },
        quantity: {
            type: Number,
        },
        stackable: {
            type: Boolean,
        },
        consumable: {
            type: Boolean,
        },
        equippable: {
            type: Boolean,
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
    { _id: false }
);

const InventorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        slots: {
            type: [InventorySlotSchema],
            validate: [
                (slots) => slots.length <= 40,
                'Your inventory is full.',
            ],
        },
    },
    { timestamps: true }
);

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
