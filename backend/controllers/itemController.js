const { StatusCodes } = require('http-status-codes');
const { Item } = require('../models');

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

// @desc    Updates an item
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
        healAmount,
        armourRating,
        weaponPower,
    } = req.body;

    const item = await Item.findByIdAndUpdate(
        itemId,
        {
            name,
            description,
            image,
            stackable,
            consumable,
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

    res.status(StatusCodes.OK).json({ item });
};

// @desc    Deletes an item
// route    DELETE /api/v1/item/:itemId
// @access  Private --- Super Admin
const deleteItem = async (req, res) => {
    const { itemId } = req.params;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No item found with id ${itemId}.`);
    }
    
    res.status(StatusCodes.OK).json({ msg: 'Item deleted' });
};

module.exports = { createItem, getAllItems, updateItem, deleteItem };
