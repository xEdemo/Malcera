const ForbiddenLibrary = require('../models/ForbiddenLibrary');

// Controller for Forbidden Libraries
const forbiddenLibraryController = {
  // Create a new Forbidden Library
  createForbiddenLibrary: async (req, res) => {
    try {
      const forbiddenLibrary = await ForbiddenLibrary.create(req.body);
      return res.status(201).json(forbiddenLibrary);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while creating the Forbidden Library.' });
    }
  },

  // Get all Forbidden Libraries
  getAllForbiddenLibraries: async (req, res) => {
    try {
      const forbiddenLibraries = await ForbiddenLibrary.find();
      return res.json(forbiddenLibraries);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while fetching Forbidden Libraries.' });
    }
  },

  // Get a specific Forbidden Library by ID
  getForbiddenLibraryById: async (req, res) => {
    try {
      const forbiddenLibrary = await ForbiddenLibrary.findById(req.params.id);
      if (!forbiddenLibrary) {
        return res.status(404).json({ error: 'Forbidden Library not found.' });
      }
      return res.json(forbiddenLibrary);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while fetching the Forbidden Library.' });
    }
  },

  // Update a Forbidden Library by ID
  updateForbiddenLibrary: async (req, res) => {
    try {
      const forbiddenLibrary = await ForbiddenLibrary.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!forbiddenLibrary) {
        return res.status(404).json({ error: 'Forbidden Library not found.' });
      }
      return res.json(forbiddenLibrary);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while updating the Forbidden Library.' });
    }
  },

  // Delete a Forbidden Library by ID
  deleteForbiddenLibrary: async (req, res) => {
    try {
      const forbiddenLibrary = await ForbiddenLibrary.findByIdAndDelete(req.params.id);
      if (!forbiddenLibrary) {
        return res.status(404).json({ error: 'Forbidden Library not found.' });
      }
      return res.json({ message: 'Forbidden Library deleted successfully.' });
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while deleting the Forbidden Library.' });
    }
  },
};

module.exports = forbiddenLibraryController;
