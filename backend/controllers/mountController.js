const { StatusCodes } = require('http-status-codes');
const { Mount } = require('../models');

// @desc    Create Mount
// @route   POST /api/v1/mount
// @access  Private (Super Admin)
const createMount = async (req, res) => {
    const { name, description, speed, type } = req.body;

    if (!name || !description || !speed || !type) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Please fill out all required fields.');
    }

    const mount = new Mount({
        name,
        description,
        speed,
        type,
    });

    await mount.save();
    res.status(StatusCodes.CREATED).json({ mount });
};

// @desc    Get all Mounts
// @route   GET /api/v1/mount
// @access  Private (Admin)
const getAllMounts = async (req, res) => {
    const { name, speed, type, sort, fields } = req.query;
    const queryObject = {};
    if (name) {
        // $options: 'i' is non-case sensitive
        queryObject.name = { $regex: name, $options: 'i' };
    }
    if (speed) {
        queryObject.speed = speed;
    }
    if (type) {
        queryObject.type = { $regex: type, $options: 'i' };
    }

    let result = Mount.find(queryObject);
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
    const mounts = await result;
    res.status(StatusCodes.OK).json({ count: mounts.length, mounts });
};

// @desc    Update Mount
// @route   PUT /api/v1/mount/:mountId
// @access  Private (Super Admin)
const updateMount = async (req, res) => {
    const { mountId } = req.params;
    const { name, description, speed, type } = req.body;

    // For required fields
    if (name === '' || description === '' || speed === '' || type === '') {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Required fields need a number, string, object, or boolean.');
    }
    // End for required fields
    const filter = { _id: mountId }
    const mount = await Mount.findOneAndUpdate(
        filter,
        { name, description, speed, type },
        { new: true }
    );

    if (!mount) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No mount found with an ID of ${mountId}.`);
    }

    res.status(StatusCodes.OK).json({ mount });
};

// @desc    Delete Mount
// @route   DELETE /api/v1/mount/:mountId
// @access  Private (Super Admin)
const deleteMount = async (req, res) => {
    const { mountId } = req.params;
    const mount = await Mount.findByIdAndDelete(mountId);

    if (!mount) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No Mount found with an ID of ${mountId}.`);
    }

    res.status(StatusCodes.OK).json({ message: 'Mount deleted successfully.' });
};

module.exports = {
    createMount,
    getAllMounts,
    updateMount,
    deleteMount,
};
