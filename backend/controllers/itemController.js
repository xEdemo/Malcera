const { StatusCodes } = require('http-status-codes');
const { Item, Inventory } = require('../models');

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
        healAmount,
        armourRating,
        weaponPower,
    } = req.body;
    if (!name || !description || !image) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`Please fill out all required fields.`);
    }

    const item = new Item({
        name,
        description,
        image,
        stackable,
        consumable,
        equippable,
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
    const items = await Item.find({}).select('-__v').sort('name');
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
        healAmount,
        armourRating,
        weaponPower,
    } = req.body;

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

    // Find all inventories that have this item
    const inventories = await Inventory.find({ 'slots.item': itemId })
    if (!inventories || inventories.length === 0) {
        res.status(StatusCodes.OK).json({ item, msg: "Item updated. No inventories updated" });
        return;
    }

    // Update the item in each inventory
    let numberOfInventoriesUpdated = 0;
    await Promise.all(
        inventories.map(async (inventory) => {
            let updated = false;
            inventory.slots.forEach((slot) => {
                if (slot.item?.toString() === itemId) {
                    // Update the item properties in the inventory
                    Object.assign(slot, {
                        name,
                        description,
                        image,
                        stackable,
                        consumable,
                        equippable,
                        healAmount,
                        armourRating,
                        weaponPower,
                    });
                    updated = true;
                }
            });
            if (updated) {
                await inventory.save();
                numberOfInventoriesUpdated++;
            }
        })
    );

    res.status(StatusCodes.OK).json({ item, numberOfInventoriesUpdated });
};

// @desc    Deletes an item
// route    DELETE /api/v1/item/:itemId
// @access  Private --- Super Admin
const deleteItem = async (req, res) => {
    const { itemId } = req.params;
    const emptySlotID = '655ac0ef72adb7c251f09e80'

    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No item found with id ${itemId}.`);
    }

    // Find all inventories that have this item
    const inventories = await Inventory.find({ 'slots.item': itemId })
    if (!inventories || inventories.length === 0) {
        res.status(StatusCodes.OK).json({ item, msg: "Item deleted. No inventories updated" });
        return;
    }

    // Find "Empty Slot" item
    const emptySlot = await Item.findById(emptySlotID);
    if (!emptySlot) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Placeholder item not found.');
    }

    // Update the item in each inventory with the "Empty Slot" item
    let numberOfInventoriesUpdated = 0;
    await Promise.all(
        inventories.map(async (inventory) => {
            let updated = false;
            inventory.slots.forEach((slot) => {
                if (slot.item?.toString() === itemId) {
                    // Replace the item with the "Empty Slot" item
                    slot._id = emptySlot._id;
                    slot.name = emptySlot.name;
                    slot.description = emptySlot.description;
                    slot.image = emptySlot.image;
                    slot.stackable = emptySlot.stackable;
                    slot.consumable = emptySlot.consumable;
                    slot.equippable = emptySlot.equippable;
                    slot.item = undefined;
                    slot.healAmount = undefined;
                    slot.armourRating = undefined;
                    slot.weaponPower = undefined;
                    slot.quantity = undefined;
                    updated = true;
                }
            });
            if (updated) {
                await inventory.save();
                numberOfInventoriesUpdated++;
            }
        })
    );
    
    res.status(StatusCodes.OK).json({ item, msg: 'Item deleted', numberOfInventoriesUpdated });
};

module.exports = { createItem, getAllItems, updateItem, deleteItem };
