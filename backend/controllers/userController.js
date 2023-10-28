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

    const hatchetItem = await Item.findById(hatchetId);
    const pickaxeItem = await Item.findById(pickaxeId);
    const breadCrumbsItem = await Item.findById(breadCrumbsId);

    const numberOfStarterHatchets = 15;
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
    } else {
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
    } else {
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
    } else {
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
    const inventory = await Inventory.findOne({ _id: user.inventory })

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
