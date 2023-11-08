const LostTreasure = require('../models/LostTreasure');

const createLostTreasure = async (req, res) => {
  try {
    const lostTreasure = await LostTreasure.create(req.body);
    return res.status(201).json(lostTreasure);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the Lost Treasure.' });
  }
};

const getAllLostTreasures = async (req, res) => {
  try {
    const lostTreasures = await LostTreasure.find();
    return res.json(lostTreasures);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching Lost Treasures.' });
  }
};

const updateLostTreasure = async (req, res) => {
  const treasureId = req.params.id;
  try {
    const updatedLostTreasure = await LostTreasure.findByIdAndUpdate(treasureId, req.body, { new: true });
    if (!updatedLostTreasure) {
      return res.status(404).json({ error: 'Lost Treasure not found.' });
    }
    return res.json(updatedLostTreasure);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating the Lost Treasure.' });
  }
};

const deleteLostTreasure = async (req, res) => {
  const treasureId = req.params.id;
  try {
    const deletedLostTreasure = await LostTreasure.findByIdAndRemove(treasureId);
    if (!deletedLostTreasure) {
      return res.status(404).json({ error: 'Lost Treasure not found.' });
    }
    return res.json({ message: 'Lost Treasure deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the Lost Treasure.' });
  }
};

module.exports = { createLostTreasure, getAllLostTreasures, updateLostTreasure, deleteLostTreasure };
