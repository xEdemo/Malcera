const BlackMarket = require('../models/BlackMarket');

const createBlackMarket = async (req, res) => {
  try {
    const blackMarket = await BlackMarket.create(req.body);
    return res.status(201).json(blackMarket);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the Black Market.' });
  }
};

const getAllBlackMarkets = async (req, res) => {
  try {
    const blackMarkets = await BlackMarket.find();
    return res.json(blackMarkets);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching Black Markets.' });
  }
};

const getBlackMarketById = async (req, res) => {
  try {
    const blackMarket = await BlackMarket.findById(req.params.id);
    if (!blackMarket) {
      return res.status(404).json({ error: 'Black Market not found.' });
    }
    return res.json(blackMarket);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching the Black Market.' });
  }
};

const updateBlackMarket = async (req, res) => {
  try {
    const blackMarket = await BlackMarket.findByIdAndUpdate(req.params.marketId, req.body, { new: true });
    if (!blackMarket) {
      return res.status(404).json({ error: 'Black Market not found.' });
    }
    return res.json(blackMarket);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating the Black Market.' });
  }
};

const deleteBlackMarket = async (req, res) => {
  try {
    const blackMarket = await BlackMarket.findByIdAndDelete(req.params.marketId);
    if (!blackMarket) {
      return res.status(404).json({ error: 'Black Market not found.' });
    }
    return res.json({ message: 'Black Market deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the Black Market.' });
  }
};

module.exports = {
  createBlackMarket,
  getAllBlackMarkets,
  getBlackMarketById,
  updateBlackMarket,
  deleteBlackMarket,
};
