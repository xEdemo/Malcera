const { Inventory, User, Item } = require('../models');
const { StatusCodes } = require('http-status-codes');

// @desc    Updates Inventory on Drag
// @route   PUT /api/v1/inventory/on-drop
// @access  Private
const updateInventoryOnDrop = async (req, res) => {
    const userId = req.user._id.toString();
    const { updatedItems, changedIndices } = req.body;

    if (!updatedItems || !changedIndices) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No inventory data update provided.`);
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No user found with id ${userId}.`);
    }

    const inventory = await Inventory.findById(user.inventory);

    changedIndices.forEach((index) => {
        inventory.slots[index] = updatedItems[index];
    });

    await inventory.save();

    res.status(StatusCodes.OK).json({ updatedInventory: inventory });
};

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

    res.status(StatusCodes.OK).json({ updatedInventory: inventory });
};

// @desc    Splits a stackable item
// @route   PUT /api/v1/inventory/split
// @access  Private
const splitStackableItem = async (req, res) => {
    const userId = req.user._id.toString();
    const { index, amount } = req.body;

    if (!amount) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No amount entered or an amount of 0 was enter.`);
    }

    if (!Number.isInteger(amount) || amount <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            msg: 'Please enter a valid whole number greater than zero.',
        });
    }

    if (!Number.isInteger(index)) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`Index is not a number.`);
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No user found with id ${userId}.`);
    }

    const inventory = await Inventory.findById(user.inventory);

    const checkForEmpty = inventory.slots.some(
        (item) => item.name === 'Empty Slot' || item === null
    );

    if (!checkForEmpty) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No empty slot found.`);
    }

    const emptySlotIndex = inventory.slots.findIndex(
        (item) => item.name === 'Empty Slot' || item === null || !item.name
    );

    const originalQuantity = inventory.slots[index].quantity;

    if (originalQuantity <= 1) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: `Cannot split a quantity less than one.` });
    }

    if (amount === originalQuantity) {
        return res
            .status(StatusCodes.OK)
            .json({ msg: `Nothing changed on split.` });
    }

    const splitAmount = originalQuantity - amount;

    // Step 1: Move the item from the original index to the empty slot
    await Inventory.findByIdAndUpdate(
        user.inventory,
        { $set: { [`slots.${emptySlotIndex}`]: inventory.slots[index] } },
        { new: true }
    );

    // Step 2: Update quantities for both indices
    await Inventory.findByIdAndUpdate(
        user.inventory,
        { $set: { [`slots.${emptySlotIndex}.quantity`]: amount } },
        { new: true }
    );
    await Inventory.findByIdAndUpdate(
        user.inventory,
        { $set: { [`slots.${index}.quantity`]: splitAmount } },
        { new: true }
    );

    const updatedInventory = await Inventory.findById(user.inventory);

    res.status(StatusCodes.OK).json({ updatedInventory });
};

// @desc    Combines Items on Drag
// @route   PUT /api/v1/inventory/combine
// @access  Private
const combineStackableItems = async (req, res) => {
    const userId = req.user._id.toString();
    const { emptySlotIndex, combinedIndex } = req.body;

    if (isNaN(emptySlotIndex) || isNaN(combinedIndex)) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(
            `There was an error fetching the indicies for combine.`
        );
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No user found with id ${userId}.`);
    }

    const inventory = await Inventory.findById(user.inventory);

    if (
        !inventory.slots[emptySlotIndex].stackable ||
        !inventory.slots[combinedIndex].stackable
    ) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(
            'Both items, or one of the two items are not stackable.'
        );
    }

    if (
        inventory.slots[emptySlotIndex].name !==
        inventory.slots[combinedIndex].name
    ) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Items do not match based on their names.')
    }

    const draggedQuantity = inventory.slots[emptySlotIndex].quantity;

    const emptySlotId = '655ac0ef72adb7c251f09e80';
    const emptySlotItem = await Item.findById(emptySlotId);

    if (!emptySlotItem) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Could not find empty slot item.');
    }

    inventory.slots[emptySlotIndex] = emptySlotItem;

    inventory.slots[combinedIndex].quantity += draggedQuantity;

    await inventory.save();

    res.status(StatusCodes.OK).json({ updatedInventory: inventory });
};

// @desc    Removes an item from inventory
// @route   PUT /api/v1/inventory/remove
// @access  Private
const removeItem = async (req, res) => {
    const userId = req.user._id.toString();
    const { index } = req.body;

    if (!Number.isInteger(index)) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`Index is not a number.`);
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No user found with id ${userId}.`);
    }

    const inventory = await Inventory.findById(user.inventory);

    const emptySlotId = '655ac0ef72adb7c251f09e80';
    const emptySlotItem = await Item.findById(emptySlotId);

    if (!emptySlotItem) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Could not find empty slot item.');
    }

    inventory.slots[index] = emptySlotItem;

    await inventory.save();

    res.status(StatusCodes.OK).json({ msg: 'Item removed.' });
};

module.exports = {
    updateInventoryOnDrop,
    getInventory,
    splitStackableItem,
    combineStackableItems,
    removeItem,
};
