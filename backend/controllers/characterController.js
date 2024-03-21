const { User, Character } = require('../models');
const { StatusCodes } = require('http-status-codes');

// @desc    Updates Character on Equip
// @route   PUT /api/v1/character/on-equip
// @access  Private
const updateCharacterOnEquip = async (req, res) => {
    const userId = req.user._id.toString();

    res.status(StatusCodes.OK).json({ userId });
}

// @desc    Grabs Character
// @route   GET /api/v1/character
// @access  Private
const getCharacter = async (req, res) => {
    const userId = req.user._id.toString();
    const user = await User.findById(userId);

    if (!user) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No user found with id ${userId}.`);
    }

    const character = await Character.findById(user.character);

    res.status(StatusCodes.OK).json({ character });
}

module.exports = {
    updateCharacterOnEquip,
    getCharacter,
}