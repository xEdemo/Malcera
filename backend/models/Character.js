const mongoose = require('mongoose')

const CharacterSlotSchema = new mongoose.Schema(
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

const CharacterSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        equipment: {
            helmet: CharacterSlotSchema,
            neck: CharacterSlotSchema,
            chest: CharacterSlotSchema,
            greaves: CharacterSlotSchema,
            boots: CharacterSlotSchema,
            gauntlets: CharacterSlotSchema,
            weaponRight: CharacterSlotSchema,
            weaponLeft: CharacterSlotSchema,
            handJewelryRight: CharacterSlotSchema,
            handJewelryLeft: CharacterSlotSchema,
            mantle: CharacterSlotSchema,
            ammo: CharacterSlotSchema,
        },
    },
    { timestamps: true }
);

const Character = mongoose.model('Character', CharacterSchema);

module.exports = Character;