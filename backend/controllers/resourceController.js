const { StatusCodes } = require('http-status-codes');
const { Resource } = require('../models');

// @desc    Create Resource
// @route   POST /api/v1/resource
// @access  Private (Super Admin)
const createResource = async (req, res) => {
    const { type, resourceType, tier } = req.body;

    if (!type || !resourceType || !tier) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Please fill out all required fields.');
    }

    const resource = new Resource({
        type,
        resourceType,
        tier,
    });

    await resource.save();
    res.status(StatusCodes.CREATED).json({ resource });
};

// @desc    Get all Resources
// @route   GET /api/v1/resource
// @access  Private (Admin)
const getAllResources = async (req, res) => {
    const { type, resourceType, tier, sort, fields } = req.query;
    const queryObject = {};
    if (type) {
        queryObject.type = type;
    }
    if (resourceType) {
        // $options: 'i' is non-case sensitive
        queryObject.resourceType = { $regex: resourceType, $options: 'i' };
    }
    if (tier) {
        queryObject.tier = tier;
    }

    let result = Resource.find(queryObject);
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
    const resources = await result;
    res.status(StatusCodes.OK).json({ count: resources.length, resources });
};

// @desc    Update Resource
// @route   PUT /api/v1/resource/:resourceId
// @access  Private (Super Admin)
const updateResource = async (req, res) => {
    const { resourceId } = req.params;
    const { type, resourceType, tier } = req.body;

    // For required fields
    if ( type === '' || resourceType === '' || tier === '') {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Required fields need a number, string, object, or boolean.');
    }
    // End for required fields
    const filter = { _id: resourceId }
    const resource = await Resource.findOneAndUpdate(
        filter,
        { type, resourceType, tier },
        { new: true }
    );

    if (!resource) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No resource found with an ID of ${resourceId}.`);
    }

    res.status(StatusCodes.OK).json({ resource });
};

// @desc    Delete Resource
// @route   DELETE /api/v1/resource/:resourceId
// @access  Private (Super Admin)
const deleteResource = async (req, res) => {
    const { resourceId } = req.params;
    const resource = await Resource.findByIdAndDelete(resourceId);

    if (!resource) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No Resource found with an ID of ${resourceId}.`);
    }

    res.status(StatusCodes.OK).json({ message: 'Resource deleted successfully.' });
};

module.exports = {
    createResource,
    getAllResources,
    updateResource,
    deleteResource,
};
