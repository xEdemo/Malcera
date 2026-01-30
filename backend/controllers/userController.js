const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const { User, Inventory, Item, Character } = require("../models");
const { createJWT, addItemToInventory, ensureInventoryForUser } = require("../utils");
const { EQUIP_SLOTS } = require("../utils/enum.js")

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

	const inventory = await ensureInventoryForUser(user._id);
	user.inventory = inventory._id;

	const character = await Character.create({ user: user._id });
	user.character = character._id;

	await user.save();

	const [hatchet, pickaxe, breadCrumbs, arrows] = await Promise.all([
		Item.findOne({ key: "hatchet" }),
		Item.findOne({ key: "pickaxe" }),
		Item.findOne({ key: "bread-crumbs" }),
		Item.findOne({ key: "arrows" }),
	]);

	if (!hatchet || !pickaxe || !breadCrumbs || !arrows) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR);
		throw new Error("Starter items missing. Check Item keys / seeds.");
	}

	addItemToInventory(inventory, hatchet, 5);
	addItemToInventory(inventory, pickaxe, 1);
	addItemToInventory(inventory, breadCrumbs, 50);
	addItemToInventory(inventory, arrows, 50);

	await inventory.save();

	// character equipment init: empty
	character.equipment = Object.fromEntries(
		EQUIP_SLOTS.map((slot) => [slot, { item: null, quantity: 0 }])
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
