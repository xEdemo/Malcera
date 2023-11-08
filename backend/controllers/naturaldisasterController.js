const NaturalDisaster = require('../models/NaturalDisaster');

// Create a new natural disaster
const createNaturalDisaster = async (req, res) => {
  try {
    const disaster = await NaturalDisaster.create(req.body);
    return res.status(201).json(disaster);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the natural disaster.' });
  }
};

// Get all natural disasters
const getAllNaturalDisasters = async (req, res) => {
  try {
    const disasters = await NaturalDisaster.find();
    return res.json(disasters);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching natural disasters.' });
  }
};

// Get a specific natural disaster by ID
const getNaturalDisasterById = async (req, res) => {
  try {
    const disaster = await NaturalDisaster.findById(req.params.disasterId);
    if (!disaster) {
      return res.status(404).json({ error: 'Natural disaster not found.' });
    }
    return res.json(disaster);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching the natural disaster.' });
  }
};

// Update a natural disaster by ID
const updateNaturalDisaster = async (req, res) => {
  try {
    const disaster = await NaturalDisaster.findByIdAndUpdate(req.params.disasterId, req.body, { new: true });
    if (!disaster) {
      return res.status(404).json({ error: 'Natural disaster not found.' });
    }
    return res.json(disaster);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating the natural disaster.' });
  }
};

// Delete a natural disaster by ID
const deleteNaturalDisaster = async (req, res) => {
  try {
    const disaster = await NaturalDisaster.findByIdAndDelete(req.params.disasterId);
    if (!disaster) {
      return res.status(404).json({ error: 'Natural disaster not found.' });
    }
    return res.json({ message: 'Natural disaster deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the natural disaster.' });
  }
};

module.exports = {
  createNaturalDisaster,
  getAllNaturalDisasters,
  getNaturalDisasterById,
  updateNaturalDisaster,
  deleteNaturalDisaster,
};
