const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { User, Inventory, Item } = require('../models');
const { createJWT } = require('../utils');

// @desc    Sign Up a new user
// route    POST /api/v1/user
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const userEmailExists = await User.findOne({ email });
    const userUsernameExists = await User.findOne({ username });

    if (userEmailExists) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`User with the email ${email} already exists.`);
    }
    if (userUsernameExists) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`The username ${username} is already taken.`);
    }

    const user = await User.create({ username, email, password });
    const inventory = await Inventory.create({ user: user._id });

    user.inventory = inventory._id;
    await user.save();

    const hatchetId = '64cac3298525d56c05347d01';
    const pickaxeId = '64cbdded7ebd956606da7694';
    const breadCrumbsId = '64cbdea9de2266abdc3aa002';
    const emptySlotId = '655ac0ef72adb7c251f09e80';

    const hatchetItem = await Item.findById(hatchetId);
    const pickaxeItem = await Item.findById(pickaxeId);
    const breadCrumbsItem = await Item.findById(breadCrumbsId);
    const emptySlotItem = await Item.findById(emptySlotId);

    const numberOfStarterHatchets = 5;
    const numberOfStarterPickaxes = 1;
    const numberOfStarterBreadCrumbs = 50;

    // Starter items here
    if (hatchetItem.stackable) {
        inventory.slots.push({
            item: hatchetItem._id,
            name: hatchetItem.name,
            description: hatchetItem.description,
            image: hatchetItem.image,
            quantity: numberOfStarterHatchets,
            stackable: hatchetItem.stackable,
            consumable: hatchetItem.consumable,
            healAmount: hatchetItem.healAmount,
            armourRating: hatchetItem.armourRating,
            weaponPower: hatchetItem.weaponPower,
        });
    } else if (!hatchetItem.stackable && numberOfStarterHatchets >= 1) {
        for (let i = 0; i < numberOfStarterHatchets; i++) {
            inventory.slots.push({
                item: hatchetItem._id,
                name: hatchetItem.name,
                description: hatchetItem.description,
                image: hatchetItem.image,
                quantity: 1,
                stackable: hatchetItem.stackable,
                consumable: hatchetItem.consumable,
                healAmount: hatchetItem.healAmount,
                armourRating: hatchetItem.armourRating,
                weaponPower: hatchetItem.weaponPower,
            });
        }
    }

    if (pickaxeItem.stackable) {
        inventory.slots.push({
            item: pickaxeItem._id,
            name: pickaxeItem.name,
            description: pickaxeItem.description,
            image: pickaxeItem.image,
            quantity: numberOfStarterPickaxes,
            stackable: pickaxeItem.stackable,
            consumable: pickaxeItem.consumable,
            healAmount: pickaxeItem.healAmount,
            armourRating: pickaxeItem.armourRating,
            weaponPower: pickaxeItem.weaponPower,
        });
    } else if (!pickaxeItem.stackable && numberOfStarterPickaxes >= 1) {
        for (let i = 0; i < numberOfStarterPickaxes; i++) {
            inventory.slots.push({
                item: pickaxeItem._id,
                name: pickaxeItem.name,
                description: pickaxeItem.description,
                image: pickaxeItem.image,
                quantity: 1,
                stackable: pickaxeItem.stackable,
                consumable: pickaxeItem.consumable,
                healAmount: pickaxeItem.healAmount,
                armourRating: pickaxeItem.armourRating,
                weaponPower: pickaxeItem.weaponPower,
            });
        }
    }

    if (breadCrumbsItem.stackable) {
        inventory.slots.push({
            item: breadCrumbsItem._id,
            name: breadCrumbsItem.name,
            description: breadCrumbsItem.description,
            image: breadCrumbsItem.image,
            quantity: numberOfStarterBreadCrumbs,
            stackable: breadCrumbsItem.stackable,
            consumable: breadCrumbsItem.consumable,
            healAmount: breadCrumbsItem.healAmount,
            armourRating: breadCrumbsItem.armourRating,
            weaponPower: breadCrumbsItem.weaponPower,
        });
    } else if (!breadCrumbsItem.stackable && numberOfStarterBreadCrumbs >= 1) {
        for (let i = 0; i < numberOfStarterBreadCrumbs; i++) {
            inventory.slots.push({
                item: breadCrumbsItem._id,
                name: breadCrumbsItem.name,
                description: breadCrumbsItem.description,
                image: breadCrumbsItem.image,
                quantity: 1,
                stackable: breadCrumbsItem.stackable,
                consumable: breadCrumbsItem.consumable,
                healAmount: breadCrumbsItem.healAmount,
                armourRating: breadCrumbsItem.armourRating,
                weaponPower: breadCrumbsItem.weaponPower,
            });
        }
    }

    const totalExistingItems = inventory.slots.reduce((total, slot) => {
        // Check if the slot is not an empty slot
        if (
            slot.item &&
            slot.item.toString() !== emptySlotItem._id.toString()
        ) {
            return total + 1;
        }
        return total;
    }, 0);

    const emptySlotsNeeded = Math.max(0, 40 - totalExistingItems);

    //console.log(totalExistingItems);

    const emptySlots = Array.from(
        { length: emptySlotsNeeded },
        () => emptySlotItem
    );
    inventory.slots.push(...emptySlots);

    const itemIndex = inventory.slots.findIndex((slot) => {
        return slot.item && slot.item.toString() === pickaxeItem._id.toString();
    });

    const newSlotIndex = 10;

    if (itemIndex !== -1) {
        const movedItem = inventory.slots[itemIndex]; // Get the item to move
        inventory.slots[itemIndex] = emptySlotItem; // Set the source slot to a pseudo item

        // Swap operation - swap with the item in the target slot
        const targetItem = inventory.slots[newSlotIndex];
        inventory.slots[newSlotIndex] = movedItem;

        //console.log('Moved Item:', movedItem);
        //console.log('Target Slot:', targetItem);
    }

    await inventory.save();

    if (user) {
        res.status(StatusCodes.CREATED).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            inventory: user.inventory,
        });
    } else {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`Invalid user data.`);
    }
});

// @desc    Auth user/set token
// route    POST /api/v1/user/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`Please enter a email and password.`);
    }

    const user = await User.findOne({ email });
    const inventory = await Inventory.findOne({ _id: user.inventory });

    if (user && (await user.matchPassword(password))) {
        createJWT(res, user._id);

        // Send info to front end to display
        res.status(StatusCodes.OK).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            banned: user.banned,
            mobKills: user.mobKills,
            attackLvl: user.attackLvl,
            attackXp: user.attackXp,
            defenseLvl: user.defenseLvl,
            defenseXp: user.defenseXp,
            strengthLvl: user.strengthLvl,
            strengthXp: user.strengthXp,
            hitpointsLvl: user.hitpointsLvl,
            hitpointsXp: user.hitpointsXp,
            healthPool: user.healthPool,
            weaponPower: user.weaponPower,
            armourRating: user.armourRating,
            jossPaper: user.jossPaper,
            actionStatus: user.actionStatus,
            inventory,
        });
    } else {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error(`Invalid email or password.`);
    }
});

// @desc    Logout user
// route    POST /api/v1/user/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(StatusCodes.OK).json({ msg: 'User logged out.' });
});

// @desc    Get user profile
// route    Get /api/v1/user/profile
// @access  Private
const getUser = asyncHandler(async (req, res) => {
    const user = {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
    };
    res.status(StatusCodes.OK).json(user);
});

// @desc    Update user profile
// route    PUT /api/v1/user/profile
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();

        res.status(StatusCodes.OK).json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
        });
    } else {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`User not found`);
    }
});

module.exports = { registerUser, authUser, logoutUser, getUser, updateUser };
