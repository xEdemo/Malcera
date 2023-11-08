const Bank = require('../models/Bank');

// Create a new bank
const createBank = async (req, res) => {
  try {
    const bank = await Bank.create(req.body);
    return res.status(201).json(bank);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the bank.' });
  }
};

// Get all banks
const getAllBanks = async (req, res) => {
  try {
    const banks = await Bank.find();
    return res.json(banks);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching banks.' });
  }
};

// Update a bank by ID
const updateBank = async (req, res) => {
  try {
    const bank = await Bank.findByIdAndUpdate(req.params.bankId, req.body, { new: true });
    if (!bank) {
      return res.status(404).json({ error: 'Bank not found.' });
    }
    return res.json(bank);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating the bank.' });
  }
};

// Delete a bank by ID
const deleteBank = async (req, res) => {
  try {
    const bank = await Bank.findByIdAndDelete(req.params.bankId);
    if (!bank) {
      return res.status(404).json({ error: 'Bank not found.' });
    }
    return res.json({ message: 'Bank deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the bank.' });
  }
};

module.exports = {
  createBank,
  getAllBanks,
  updateBank,
  deleteBank,
};
