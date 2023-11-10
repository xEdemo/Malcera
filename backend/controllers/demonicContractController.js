const { StatusCodes } = require('http-status-codes');
const { DemonicContract } = require('../models/DemonicContract');

// @desc    Create Demonic Contract
// @route   POST /api/v1/demonic-contracts
// @access  Private (Super Admin)
const createDemonicContract = async (req, res) => {
    const { contractName, demonEntity, terms, cost, consequences, holder, isActive } = req.body;

    if (!contractName || !demonEntity || !terms || !cost || !consequences || !holder) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Please fill out all required fields.');
    }

    const contract = new DemonicContract({
        contractName,
        demonEntity,
        terms,
        cost,
        consequences,
        holder,
        isActive,
    });

    await contract.save();
    res.status(StatusCodes.CREATED).json({ contract });
};

// @desc    Get all Demonic Contracts
// @route   GET /api/v1/demonic-contracts
// @access  Private (Admin)
const getAllDemonicContracts = async (req, res) => {
    const contracts = await DemonicContract.find({});
    res.status(StatusCodes.OK).json({ count: contracts.length, contracts });
};

// @desc    Get Demonic Contract by ID
// @route   GET /api/v1/demonic-contracts/:contractId
// @access  Private (Admin)
const getDemonicContractById = async (req, res) => {
    const contractId = req.params.contractId;
    const contract = await DemonicContract.findById(contractId);
    if (!contract) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`Demonic Contract with ID ${contractId} not found.`);
    }
    res.status(StatusCodes.OK).json({ contract });
};

// @desc    Update Demonic Contract
// @route   PUT /api/v1/demonic-contracts/:contractId
// @access  Private (Super Admin)
const updateDemonicContract = async (req, res) => {
    const contractId = req.params.contractId;
    const { contractName, demonEntity, terms, cost, consequences, holder, isActive } = req.body;

    const filter = { _id: contractId };
    const updatedContract = await DemonicContract.findOneAndUpdate(
        filter,
        { contractName, demonEntity, terms, cost, consequences, holder, isActive },
        { new: true }
    );

    if (!updatedContract) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No Demonic Contract found with an ID of ${contractId}.`);
    }

    res.status(StatusCodes.OK).json({ updatedContract });
};

// @desc    Delete Demonic Contract
// @route   DELETE /api/v1/demonic-contracts/:contractId
// @access  Private (Super Admin)
const deleteDemonicContract = async (req, res) => {
    const contractId = req.params.contractId;
    const deletedContract = await DemonicContract.findByIdAndDelete(contractId);

    if (!deletedContract) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No Demonic Contract found with an ID of ${contractId}.`);
    }

    res.status(StatusCodes.OK).json({ message: 'Demonic Contract deleted successfully.' });
};

module.exports = {
    createDemonicContract,
    getAllDemonicContracts,
    getDemonicContractById,
    updateDemonicContract,
    deleteDemonicContract,
};
