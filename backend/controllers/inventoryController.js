const { Inventory, User } = require('../models');
const { StatusCodes } = require('http-status-codes');

// @desc    Updates Inventory on Drag
// @route   PUT /api/v1/inventory/on-drop
// @access  Private 
const updateInventoryOnDrop = async (req, res) => {
    const userId = req.user._id.toString();
    const { updatedItems, changedIndices } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No user found with id ${userId}.`);
    }

    if (!updatedItems || !changedIndices) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No inventory data update provided.`);
    }

    const inventory = await Inventory.findById(user.inventory);

    changedIndices.forEach((index) => {
        inventory.slots[index] = updatedItems[index];
    });

    await inventory.save();

    console.log(changedIndices);

    res.status(StatusCodes.OK).json({updatedInventory: inventory});
}

// @desc    Grabs Inventory
// @route   GET /api/v1/inventory
// @access  Private 
const getInventory = async (req, res) => {
    const userId = req.user._id.toString();
    const user = await User.findById(userId);

    if (!user) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No user found with id ${userId}.`);
    }

    const inventory = await Inventory.findById(user.inventory);

    res.status(StatusCodes.OK).json({ updatedInventory: inventory});
}

module.exports = {
    updateInventoryOnDrop,
    getInventory,
};