const Flora = require('../models/Flora');

const floraController = {
  getAllFlora: async (req, res) => {
    try {
      const flora = await Flora.find();
      return res.json(flora);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while fetching flora.' });
    }
  },

  getFloraById: async (req, res) => {
    try {
      const flora = await Flora.findById(req.params.id);
      if (!flora) {
        return res.status(404).json({ error: 'Flora not found.' });
      }
      return res.json(flora);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while fetching flora.' });
    }
  },

  createFlora: async (req, res) => {
    try {
      const newFlora = await Flora.create(req.body);
      return res.status(201).json(newFlora);
    } catch (error) {
      return res.status(500).json({ error: 'Unable to create flora.' });
    }
  },

  updateFlora: async (req, res) => {
    const floraId = req.params.id;
    try {
      const updatedFlora = await Flora.findByIdAndUpdate(floraId, req.body, { new: true });
      if (!updatedFlora) {
        return res.status(404).json({ error: 'Flora not found.' });
      }
      return res.json(updatedFlora);
    } catch (error) {
      return res.status(500).json({ error: 'Unable to update flora.' });
    }
  },

  deleteFlora: async (req, res) => {
    const floraId = req.params.id;
    try {
      const deletedFlora = await Flora.findByIdAndRemove(floraId);
      if (!deletedFlora) {
        return res.status(404).json({ error: 'Flora not found.' });
      }
      return res.json({ message: 'Flora deleted successfully.' });
    } catch (error) {
      return res.status(500).json({ error: 'Unable to delete flora.' });
    }
  },

  // Add more controller methods for managing flora
};

module.exports = floraController;
