const ReligiousEvent = require('../models/ReligiousEvent');

// Create a new religious event
const createReligiousEvent = async (req, res) => {
  try {
    const religiousEvent = await ReligiousEvent.create(req.body);
    return res.status(201).json(religiousEvent);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the religious event.' });
  }
};

// Get all religious events
const getAllReligiousEvents = async (req, res) => {
  try {
    const religiousEvents = await ReligiousEvent.find();
    return res.json(religiousEvents);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching religious events.' });
  }
};

// Get a religious event by ID
const getReligiousEventById = async (req, res) => {
  try {
    const religiousEvent = await ReligiousEvent.findById(req.params.id);
    if (!religiousEvent) {
      return res.status(404).json({ error: 'Religious event not found.' });
    }
    return res.json(religiousEvent);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching the religious event.' });
  }
};

// Update a religious event by ID
const updateReligiousEvent = async (req, res) => {
  try {
    const religiousEvent = await ReligiousEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!religiousEvent) {
      return res.status(404).json({ error: 'Religious event not found.' });
    }
    return res.json(religiousEvent);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating the religious event.' });
  }
};

// Delete a religious event by ID
const deleteReligiousEvent = async (req, res) => {
  try {
    const religiousEvent = await ReligiousEvent.findByIdAndDelete(req.params.id);
    if (!religiousEvent) {
      return res.status(404).json({ error: 'Religious event not found.' });
    }
    return res.json({ message: 'Religious event deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the religious event.' });
  }
};

module.exports = {
  createReligiousEvent,
  getAllReligiousEvents,
  getReligiousEventById,
  updateReligiousEvent,
  deleteReligiousEvent,
};
