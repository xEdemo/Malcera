const { StatusCodes } = require('http-status-codes');
const { ReligiousCovenant: ReligiousCovenant } = require('../models');

// @desc    Create ReligiousCovenant
// @route   POST /api/v1/religiousCovenant
// @access  Private (Super Admin)
const createReligiousCovenant = async (req, res) => {
    const { name, description, material, religiousOrder, rarity } = req.body;

    if (!name || !description || !material || !religiousOrder || !rarity) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Please fill out all required fields.');
    }

    const religiousCovenant = new ReligiousCovenant({
        name,
        description,
        material,
        religiousOrder,
        rarity,
    });

    await religiousCovenant.save();
    res.status(StatusCodes.CREATED).json({ religiousCovenant: religiousCovenant });
};

// @desc    Get all ReligiousCovenants
// @route   GET /api/v1/religiousCovenant
// @access  Private (Admin)
const getAllReligiousCovenants = async (req, res) => {
    const { name, description, material, religiousOrder, rarity, sort, fields } = req.query;
    const queryObject = {};
    if (name) {
        // $options: 'i' is non-case sensitive
        queryObject.name = { $regex: name, $options: 'i' };
    }
    if (description) {
        queryObject.description = description;
    }
    if (material) {
        queryObject.material = { $regex: material, $options: 'i' };
    }
    if (religiousOrder) {
        queryObject.religiousOrder = { $regex: religiousOrder, $options: 'i' };
    }
    if (rarity) {
        queryObject.rarity = { $regex: rarity, $options: 'i' };
    }



    let result = ReligiousCovenant.find(queryObject);
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
    const religiousCovenants = await result;
    res.status(StatusCodes.OK).json({ count: religiousCovenants.length, religiousCovenants });
};

// @desc    Update ReligiousCovenant
// @route   PUT /api/v1/religiousCovenant/:religiousCovenantId
// @access  Private (Super Admin)
const updateReligiousCovenant = async (req, res) => {
    const { religiousCovenantId } = req.params;
    const { name, description, material, religiousOrder, rarity } = req.body;

    // For required fields
    if (name === '' || description === '' || material === '' || religiousOrder === ''|| rarity === '') {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Required fields need a number, string, object, or boolean.');
    }
    // End for required fields
    const filter = { _id: religiousCovenantId }
    const religiousCovenant = await ReligiousCovenant.findOneAndUpdate(
        filter,
        { name, description, material, religiousOrder, rarity },
        { new: true }
    );

    if (!religiousCovenant) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No religiousCovenant found with an ID of ${religiousCovenantId}.`);
    }

    res.status(StatusCodes.OK).json({ religiousCovenant });
};

// @desc    Delete religiousCovenant
// @route   DELETE /api/v1/religiousCovenant/:religiousCovenantId
// @access  Private (Super Admin)
const deleteReligiousCovenant = async (req, res) => {
    const { religiousCovenantId } = req.params;
    const religiousCovenant = await ReligiousCovenant.findByIdAndDelete(religiousCovenantId);

    if (!religiousCovenant) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No religiousCovenant found with an ID of ${religiousCovenantId}.`);
    }

    res.status(StatusCodes.OK).json({ message: 'religiousCovenant deleted successfully.' });
};

module.exports = {
    createReligiousCovenant,
    getAllReligiousCovenants,
    updateReligiousCovenant,
    deleteReligiousCovenant,
};
