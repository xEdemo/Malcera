const { StatusCodes } = require('http-status-codes');
const { Artifact } = require('../models');

// @desc    Create Artifact
// @route   POST /api/v1/artifact
// @access  Private (Super Admin)
const createArtifact = async (req, res) => {
    const { name, description, rarity, alignment, religiousOrder, materialComposition, timeSensitivity, enhancement, durability, curses, effects } = req.body;

    if (!name || !description || !rarity || !alignment || !religiousOrder || !materialComposition || !timeSensitivity || !enhancement || !durability || !curses || !effects) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Please fill out all required fields.');
    }

    const artifact = new Artifact({
        name,
        description,
        rarity,
        alignment,
        religiousOrder,
        materialComposition,
        timeSensitivity,
        enhancement,
        durability,
        curses,
        effects,

    });

    await artifact.save();
    res.status(StatusCodes.CREATED).json({ artifact });
};

// @desc    Get all Artifacts
// @route   GET /api/v1/artifact
// @access  Private (Admin)
const getAllArtifacts = async (req, res) => {
    const { name, description, rarity, alignment, religiousOrder, materialComposition, timeSensitivity, enhancement, durability, curses, effects, sort, fields } = req.query;
    const queryObject = {};
    if (name) {
        // $options: 'i' is non-case sensitive
        queryObject.name = { $regex: name, $options: 'i' };
    }
    if (description) {
        queryObject.description = description;
    }
    if (rarity) {
        queryObject.rarity = { $regex: rarity, $options: 'i' };
    }
    if (alignment) {
        queryObject.alignment = { $regex: alignment, $options: 'i' };
    }
    if (religiousOrder) {
        queryObject.religiousOrder = { $regex: religiousOrder, $options: 'i' };
    }
    if (materialComposition) {
        queryObject.materialComposition = { $regex: materialComposition, $options: 'i' };
    }
    if (timeSensitivity) {
        queryObject.timeSensitivity = { $regex: timeSensitivity, $options: 'i' };
    }
    if (enhancement) {
        queryObject.enhancement = { $regex: enhancement, $options: 'i' };
    }
    if (durability) {
        queryObject.durability = { $regex: durability, $options: 'i' };
    }
    if (curses) {
        queryObject.curses = { $regex: curses, $options: 'i' };
    }
    if (effects) {
        queryObject.effects = { $regex: effects, $options: 'i' };
    }





    let result = Artifact.find(queryObject);
    // Sort
    if (sort) {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    } else {
        result = result.sort('createdAt');
    }
    // Fields
    if (fields) {
        const fieldsList = fields.split(',').join(' ');
        result = result.select(fieldsList);
    }
    // Sets defaults if not specified
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    result = result.skip(skip).limit(limit);
    const artifacts = await result;
    res.status(StatusCodes.OK).json({ count: artifacts.length, artifacts });
};

// @desc    Update Artifact
// @route   PUT /api/v1/artifact/:artifactId
// @access  Private (Super Admin)
const updateArtifact = async (req, res) => {
    const { artifactId } = req.params;
    const { name, description, rarity, alignment, religiousOrder, materialComposition, timeSensitivity, enhancement, durability, curses, effects } = req.body;

    // For required fields
    if (name === '' || description === '' || rarity === '' || alignment === ''|| religiousOrder === ''|| materialComposition === ''|| timeSensitivity === ''|| enhancement === ''|| durability === ''|| curses === ''|| effects === '') {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Required fields need a number, string, object, or boolean.');
    }
    // End for required fields
    const filter = { _id: artifactId }
    const artifact = await Artifact.findOneAndUpdate(
        filter,
        { name, description, rarity, alignment, religiousOrder, materialComposition, timeSensitivity, enhancement, durability, curses, effects },
        { new: true }
    );

    if (!artifact) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No artifact found with an ID of ${artifactId}.`);
    }

    res.status(StatusCodes.OK).json({ artifact });
};

// @desc    Delete Artifact
// @route   DELETE /api/v1/artifact/:artifactId
// @access  Private (Super Admin)
const deleteArtifact = async (req, res) => {
    const { artifactId } = req.params;
    const artifact = await Artifact.findByIdAndDelete(artifactId);

    if (!artifact) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No Artifact found with an ID of ${artifactId}.`);
    }

    res.status(StatusCodes.OK).json({ message: 'Artifact deleted successfully.' });
};

module.exports = {
    createArtifact,
    getAllArtifacts,
    updateArtifact,
    deleteArtifact,
};
