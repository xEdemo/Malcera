const { StatusCodes } = require('http-status-codes');
const Mount = require('../models/Mount');

// @desc    Create Mount
// @route   POST /api/v1/mounts
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
// @route   GET /api/v1/mounts
// @access  Private (Admin)
const getAllMounts = async (req, res) => {
    const mounts = await Mount.find({});
    res.status(StatusCodes.OK).json({ count: mounts.length, mounts });
};

// @desc    Get Mount by ID
// @route   GET /api/v1/mounts/:mountId
// @access  Private (Admin)
const getMountById = async (req, res) => {
    const mountId = req.params.mountId;
    const mount = await Mount.findById(mountId);
    if (!mount) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`Mount with ID ${mountId} not found.`);
    }
    res.status(StatusCodes.OK).json({ mount });
};

// @desc    Update Mount
// @route   PUT /api/v1/mounts/:mountId
// @access  Private (Super Admin)
const updateMount = async (req, res) => {
    const mountId = req.params.mountId;
    const { name, description, speed, type } = req.body;

    const filter = { _id: mountId };
    const updatedMount = await Mount.findOneAndUpdate(
        filter,
        { name, description, speed, type },
        { new: true }
    );

    if (!updatedMount) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No Mount found with an ID of ${mountId}.`);
    }

    res.status(StatusCodes.OK).json({ updatedMount });
};

// @desc    Delete Mount
// @route   DELETE /api/v1/mounts/:mountId
// @access  Private (Super Admin)
const deleteMount = async (req, res) => {
    const mountId = req.params.mountId;
    const deletedMount = await Mount.findByIdAndDelete(mountId);

    if (!deletedMount) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No Mount found with an ID of ${mountId}.`);
    }

    res.status(StatusCodes.OK).json({ message: 'Mount deleted successfully.' });
};

module.exports = {
    createMount,
    getAllMounts,
    getMountById,
    updateMount,
    deleteMount,
};
