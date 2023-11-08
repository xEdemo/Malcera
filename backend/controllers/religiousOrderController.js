const ReligiousOrder = require('../models/ReligiousOrder');

// Controller for managing religious orders
const religiousOrderController = {
  // Create a new religious order
  createReligiousOrder: async (req, res) => {
    try {
      const religiousOrder = await ReligiousOrder.create(req.body);
      return res.status(201).json(religiousOrder);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while creating the religious order.' });
    }
  },

  // Get a list of all religious orders
  getAllReligiousOrders: async (req, res) => {
    try {
      const religiousOrders = await ReligiousOrder.find();
      return res.json(religiousOrders);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while fetching religious orders.' });
    }
  },

  // Get information about a specific religious order by ID
  getReligiousOrderById: async (req, res) => {
    try {
      const religiousOrder = await ReligiousOrder.findById(req.params.id);
      if (!religiousOrder) {
        return res.status(404).json({ error: 'Religious order not found.' });
      }
      return res.json(religiousOrder);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while fetching the religious order.' });
    }
  },

  // Update information for a specific religious order by ID
  updateReligiousOrder: async (req, res) => {
    try {
      const religiousOrder = await ReligiousOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!religiousOrder) {
        return res.status(404).json({ error: 'Religious order not found.' });
      }
      return res.json(religiousOrder);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while updating the religious order.' });
    }
  },

  // Delete a religious order by ID
  deleteReligiousOrder: async (req, res) => {
    try {
      const religiousOrder = await ReligiousOrder.findByIdAndDelete(req.params.id);
      if (!religiousOrder) {
        return res.status(404).json({ error: 'Religious order not found.' });
      }
      return res.json({ message: 'Religious order deleted successfully.' });
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while deleting the religious order.' });
    }
  },
};

module.exports = religiousOrderController;
