const { StatusCodes } = require('http-status-codes');
const { DemonicContract } = require('../models');

// @desc    Create Mount
// @route   POST /api/v1/mount
// @access  Private (Super Admin)
const createDemonicContract = async (req, res) => {
    const { contractName, demonEntity, terms, cost, consequences, holder, isActive } = req.body;

    if (!contractName || !demonEntity || !terms || !cost || !consequences || !holder || !isActive) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Please fill out all required fields.');
    }

    const demonicContract = new DemonicContract({
        contractName,
        demonEntity,
        terms,
        cost,
        consequences,
        holder,
        isActive,
    });

    await demonicContract.save();
    res.status(StatusCodes.CREATED).json({ demonicContract });
};

// @desc    Get all DemonicContracts
// @route   GET /api/v1/demonicContract
// @access  Private (Admin)
const getAllDemonicContracts = async (req, res) => {
    const { contractName, demonEntity, terms, cost, consequences, holder, isActive, fields } = req.query;
    const queryObject = {};
    if (contractName) {
        // $options: 'i' is non-case sensitive
        queryObject.contractName = { $regex: contractName, $options: 'i' };
    }
    if (demonEntity) {
        queryObject.demonEntity = demonEntity;
    }
    if (terms) {
        queryObject.terms = { $regex: terms, $options: 'i' };
    }
    if (cost) {
        queryObject.cost = { $regex: cost, $options: 'i'};

    }
    if  (consequences) {
        queryObject.consequences = { $regex: consequences, $options: 'i' };
    }
    if (holder) {
        queryObject.holder = { $regex: holder, $options: 'i'};
    }
    if (isActive) {
        queryObject.isActive = { $regex: isActive, $options: 'i'};
    }

    let result = DemonicContract.find(queryObject);
    // Sort
    if (req.query.sort) {
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
    const demonicContracts = await result;
    res.status(StatusCodes.OK).json({ count: demonicContracts.length, demonicContracts });
};

// @desc    Update DemonicContract
// @route   PUT /api/v1/demonicContract/:demonicContractID
// @access  Private (Super Admin)
const updateDemonicContract = async (req, res) => {
    const { demonicContractId } = req.params;
    const { contractName, demonEntity, terms, cost, consequences, holder, isActive } = req.body;

    // For required fields
    if (contractName === '' || demonEntity === '' || terms === '' || cost === ''|| consequences === ''|| holder === ''|| isActive === '') {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Required fields need a number, string, object, or boolean.');
    }
    // End for required fields
    const filter = { _id: demonicContractId }
    const demonicContract = await DemonicContract.findOneAndUpdate(
        filter,
        { contractName, demonEntity, terms, cost, consequences, holder, isActive },
        { new: true }
    );

    if (!demonicContract) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No mount found with an ID of ${demonicContractId}.`);
    }

    res.status(StatusCodes.OK).json({ demonicContract });
};

// @desc    Delete demonicContrat
// @route   DELETE /api/v1/DemonicContract/:demonicContractId
// @access  Private (Super Admin)
const deleteDemonicContract = async (req, res) => {
    const { demonicContractId } = req.params;
    const demonicContract = await DemonicContract.findByIdAndDelete(demonicContractId);

    if (!demonicContract) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No Mount found with an ID of ${demonicContractId}.`);
    }

    res.status(StatusCodes.OK).json({ message: 'DemonicContract deleted successfully.' });
};

module.exports = {
    createDemonicContract,
    getAllDemonicContracts,
    updateDemonicContract,
    deleteDemonicContract,
};