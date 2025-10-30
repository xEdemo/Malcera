const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const { User, Inventory, Item, Character } = require("../models");
const { createJWT } = require("../utils");

// @desc    Sign Up a new user
// route    POST /api/v1/user
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body;

    const rawUsername = username.trim();
	const normalizedUsername = username.trim().toLowerCase();
	const normalizedEmail = email.trim().toLowerCase();

	const userEmailExists = await User.findOne({
		"account.email": normalizedEmail,
	});
	const userUsernameExists = await User.findOne({
		"account.normalizedUsername": normalizedUsername,
	});

	if (userEmailExists) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`User with the email ${email} already exists.`);
	}
	if (userUsernameExists) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`The username ${username} is already taken.`);
	}

	const user = await User.create({
		account: {
			username: rawUsername,
            normalizedUsername,
			email: normalizedEmail,
			password,
		},
	});

	const inventory = await Inventory.create({ user: user._id });
	user.inventory = inventory._id;

	const character = await Character.create({ user: user._id });
	user.character = character._id;

	await user.save();

	const hatchetId = "64cac3298525d56c05347d01";
	const pickaxeId = "64cbdded7ebd956606da7694";
	const breadCrumbsId = "6600b968511dd95ac667965f";
	const emptySlotId = "655ac0ef72adb7c251f09e80";

	const hatchetItem = await Item.findById(hatchetId);
	const pickaxeItem = await Item.findById(pickaxeId);
	const breadCrumbsItem = await Item.findById(breadCrumbsId);
	const emptySlotItem = await Item.findById(emptySlotId);

	const numberOfStarterHatchets = 5;
	const numberOfStarterPickaxes = 1;
	const numberOfStarterBreadCrumbs = 50;

	// Push starter items
	const pushItem = (item, quantity) => {
		if (item.stackable) {
			inventory.slots.push({
				item: item._id,
				name: item.name,
				description: item.description,
				image: item.image,
				quantity,
				stackable: item.stackable,
				consumable: item.consumable,
				equippable: item.equippable,
				equippableTo: item.equippableTo,
				healAmount: item.healAmount,
				armourRating: item.armourRating,
				weaponPower: item.weaponPower,
			});
		} else {
			for (let i = 0; i < quantity; i++) {
				inventory.slots.push({
					item: item._id,
					name: item.name,
					description: item.description,
					image: item.image,
					quantity: 1,
					stackable: item.stackable,
					consumable: item.consumable,
					equippable: item.equippable,
					equippableTo: item.equippableTo,
					healAmount: item.healAmount,
					armourRating: item.armourRating,
					weaponPower: item.weaponPower,
				});
			}
		}
	};

	pushItem(hatchetItem, numberOfStarterHatchets);
	pushItem(pickaxeItem, numberOfStarterPickaxes);
	pushItem(breadCrumbsItem, numberOfStarterBreadCrumbs);

	const totalExistingItems = inventory.slots.filter(
		(slot) => slot.item?.toString() !== emptySlotId
	).length;
	//console.log(totalExistingItems);

	const emptySlotsNeeded = Math.max(0, 40 - totalExistingItems);
	const emptySlots = Array.from({ length: emptySlotsNeeded }, () => ({
		item: emptySlotId,
		...emptySlotItem.toObject(),
	}));
	inventory.slots.push(...emptySlots);

	await inventory.save();

	// Populate character slots
	character.equipment = Object.fromEntries(
		[
			"helmet",
			"neck",
			"chest",
			"greaves",
			"boots",
			"gauntlets",
			"weaponRight",
			"weaponLeft",
			"handJewelryRight",
			"handJewelryLeft",
			"mantle",
			"ammo",
		].map((slot) => [
			slot,
			{ item: emptySlotId, ...emptySlotItem.toObject() },
		])
	);

	await character.save();

	if (user) {
		res.status(StatusCodes.CREATED).json({
			_id: user._id,
			username: user.account.username,
		    email: user.account.email,
			inventory: user.inventory,
			character: user.character,
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

	const normalizedEmail = email.trim().toLowerCase();

	const user = await User.findOne({ "account.email": normalizedEmail });

	if (user && (await user.matchPassword(password))) {
		createJWT(res, user._id);
		res.status(StatusCodes.OK).json({
			_id: user._id,
			username: user.account.username,
			email: user.account.email,
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
	res.cookie("jwt", "", {
		httpOnly: true,
		expires: new Date(0),
	});
	res.status(StatusCodes.OK).json({ msg: "User logged out." });
});

// @desc    Get user profile
// route    Get /api/v1/user/profile
// @access  Private
const getUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id).select(
		"-__v -account.password -account.normalizedUsername"
	);

	res.status(StatusCodes.OK).json({ user });
});

// @desc    Update user profile
// route    PUT /api/v1/user/profile
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error(`User not found`);
	}

	user.account.username = req.body.username || user.account.username;
	user.account.email = req.body.email || user.account.email;

	if (req.body.password) {
		user.account.password = req.body.password;
	}

	const updatedUser = await user.save();
	res.status(StatusCodes.OK).json({
		_id: updatedUser._id,
		username: updatedUser.account.username,
		email: updatedUser.account.email,
	});
});

// @desc    Delete user and associated data
// route    DELETE /api/v1/user/:userId
// @access  Private --- Super Admin
const deleteUser = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	const user = await User.findById(userId);

	if (!user) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error(`No user found with an id of ${userId}.`);
	}

	await Inventory.findByIdAndDelete(user.inventory);
	await Character.findByIdAndDelete(user.character);
	await User.findByIdAndDelete(user._id);

	res.status(StatusCodes.OK).json({ msg: "User Deleted." });
});

module.exports = {
	registerUser,
	authUser,
	logoutUser,
	getUser,
	updateUser,
	deleteUser,
};
