const Temple = require('../models/Temple');

const createTemple = async (req, res) => {
  try {
    const temple = await Temple.create(req.body);
    return res.status(201).json(temple);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the temple.' });
  }
};

const getAllTemples = async (req, res) => {
  try {
    const temples = await Temple.find();
    return res.json(temples);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching temples.' });
  }
};

const getTempleById = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple) {
      return res.status(404).json({ error: 'Temple not found.' });
    }
    return res.json(temple);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching the temple.' });
  }
};

const updateTemple = async (req, res) => {
  try {
    const temple = await Temple.findByIdAndUpdate(req.params.templeId, req.body, { new: true });
    if (!temple) {
      return res.status(404).json({ error: 'Temple not found.' });
    }
    return res.json(temple);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating the temple.' });
  }
};

const deleteTemple = async (req, res) => {
  try {
    const temple = await Temple.findByIdAndDelete(req.params.templeId);
    if (!temple) {
      return res.status(404).json({ error: 'Temple not found.' });
    }
    return res.json({ message: 'Temple deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the temple.' });
  }
};

module.exports = {
  createTemple,
  getAllTemples,
  getTempleById,
  updateTemple,
  deleteTemple,
};
