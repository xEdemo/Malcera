const { StatusCodes } = require('http-status-codes');
const { SentientItem } = require('../models');

// @desc    Create SentientItem
// @route   POST /api/v1/sentientItem
// @access  Private (Super Admin)
const createSentientItem = async (req, res) => {
    const { name, description, abilities, alignment, personality, history, owner } = req.body;

    if (!name || !description || !abilities || !alignment|| !personality || !history || !owner) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Please fill out all required fields.');
    }

    const sentientItem = new SentientItem({
        name,
        description,
        abilities,
        alignment,
        personality,
        history,
        owner,
    });

    await sentientItem.save();
    res.status(StatusCodes.CREATED).json({ sentientItem });
};

// @desc    Get all SentientItems
// @route   GET /api/v1/sentientItem
// @access  Private (Admin)
const getAllSentientItems = async (req, res) => {
    const { name, description, abilities, alignment, personality, history, owner, sort, fields } = req.query;
    const queryObject = {};
    if (name) {
        // $options: 'i' is non-case sensitive
        queryObject.name = { $regex: name, $options: 'i' };
    }
    if (description) {
        queryObject.description = description;
    }
    if (abilities) {
        queryObject.abilities = { $regex: abilities, $options: 'i' };
    }

    let result = SentientItem.find(queryObject);
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
    const sentientItems = await result;
    res.status(StatusCodes.OK).json({ count: sentientItems.length, sentientItems });
};

// @desc    Update SentientItem
// @route   PUT /api/v1/sentientItem/:sentientItemId
// @access  Private (Super Admin)
const updateSentientItem = async (req, res) => {
    const { sentientItemId } = req.params;
    const { name, description, abilities, alignment, personality, history, owner } = req.body;

    // For required fields
    if (name ==='' || description === '' || abilities === '' || alignment ===''  || personality === '' || history === '' || owner === '') {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Required fields need a number, string, object, or boolean.');
    }
    // End for required fields
    const filter = { _id: sentientItemId }
    const sentientItem = await SentientItem.findOneAndUpdate(
        filter,
        { name, description, abilities, alignment, personality, history, owner},
        { new: true }
    );

    if (!sentientItem) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No sentientItem found with an ID of ${sentientItemId}.`);
    }

    res.status(StatusCodes.OK).json({ sentientItem });
};

// @desc    Delete SentientItem
// @route   DELETE /api/v1/sentientItem/:sentientItemId
// @access  Private (Super Admin)
const deleteSentientItem = async (req, res) => {
    const { sentientItemId } = req.params;
    const sentientItem = await SentientItem.findByIdAndDelete(sentientItemId);

    if (!sentientItem) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No SentientItem found with an ID of ${sentientItemId}.`);
    }

    res.status(StatusCodes.OK).json({ message: 'SentientItem deleted successfully.' });
};

module.exports = {
    createSentientItem,
    getAllSentientItems,
    updateSentientItem,
    deleteSentientItem,
};
