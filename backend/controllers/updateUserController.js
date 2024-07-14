const { User } = require('../models');
const { StatusCodes } = require('http-status-codes');

/**
 * @desc    Updates User Position When They Move on the Canvas
 * @route   PUT /api/v1/update-user/position
 * @access  Private
 */
const userPosition = async (req, res) => {
	const userId = req.user._id.toString();
	const { x, y, map } = req.body;

	if (!Number.isInteger(x) || !Number.isInteger(y)) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`x or y is not an integer.`);
	}

	const user = await User.findById(userId);

	if (!user) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`No user found with id ${userId}.`);
	}

	user.position.x = x;
	user.position.y = y;
	if (map) {
		user.currentMap = map;
	}
	await user.save();

	res.status(StatusCodes.OK).json({ msg: "Updated" })
}

/**
 * @desc    Gets User Position
 * @route   Get /api/v1/update-user/position
 * @access  Private
 */
const getUserPosition = async(req, res) => {
	const userId = req.user._id.toString();
	const user = await User.findById(userId);

	if (!user) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`No user found with id ${userId}.`);
	}

	res.status(StatusCodes.OK).json({ x: user.position.x, y: user.position.y });
}

module.exports = {
	userPosition,
	getUserPosition
}