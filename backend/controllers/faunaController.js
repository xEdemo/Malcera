const Fauna = require('../models/Fauna');

const faunaController = {
  getAllFauna: async (req, res) => {
    try {
      const fauna = await Fauna.find();
      return res.json(fauna);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while fetching fauna.' });
    }
  },

  getFaunaById: async (req, res) => {
    try {
      const fauna = await Fauna.findById(req.params.id);
      if (!fauna) {
        return res.status(404).json({ error: 'Fauna not found.' });
      }
      return res.json(fauna);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while fetching fauna.' });
    }
  },

  createFauna: async (req, res) => {
    try {
      const newFauna = await Fauna.create(req.body);
      return res.status(201).json(newFauna);
    } catch (error) {
      return res.status(500).json({ error: 'Unable to create fauna.' });
    }
  },

  updateFauna: async (req, res) => {
    const faunaId = req.params.id;
    try {
      const updatedFauna = await Fauna.findByIdAndUpdate(faunaId, req.body, { new: true });
      if (!updatedFauna) {
        return res.status(404).json({ error: 'Fauna not found.' });
      }
      return res.json(updatedFauna);
    } catch (error) {
      return res.status(500).json({ error: 'Unable to update fauna.' });
    }
  },

  deleteFauna: async (req, res) => {
    const faunaId = req.params.id;
    try {
      const deletedFauna = await Fauna.findByIdAndRemove(faunaId);
      if (!deletedFauna) {
        return res.status(404).json({ error: 'Fauna not found.' });
      }
      return res.json({ message: 'Fauna deleted successfully.' });
    } catch (error) {
      return res.status(500).json({ error: 'Unable to delete fauna.' });
    }
  },

  // Add more controller methods for managing fauna
};

module.exports = faunaController;
