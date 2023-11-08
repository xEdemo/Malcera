const Season = require('../models/Season');

const getSeasons = async (req, res) => {
  try {
    const seasons = await Season.find();
    return res.json(seasons);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching seasons.' });
  }
};

const getCurrentSeason = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1; // Adding 1 to get the month in the range of 1-12

    const season = await Season.findOne({ startMonth: { $lte: currentMonth }, endMonth: { $gte: currentMonth } });
    if (!season) {
      return res.status(404).json({ error: 'No season found for the current month.' });
    }
    return res.json(season);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while determining the current season.' });
  }
};

const createSeason = async (req, res) => {
  try {
    const season = await Season.create(req.body);
    return res.status(201).json(season);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the season.' });
  }
};

const updateSeason = async (req, res) => {
  try {
    const season = await Season.findByIdAndUpdate(req.params.seasonId, req.body, { new: true });
    if (!season) {
      return res.status(404).json({ error: 'Season not found.' });
    }
    return res.json(season);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating the season.' });
  }
};

const deleteSeason = async (req, res) => {
  try {
    const season = await Season.findByIdAndDelete(req.params.seasonId);
    if (!season) {
      return res.status(404).json({ error: 'Season not found.' });
    }
    return res.json({ message: 'Season deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the season.' });
  }
};

module.exports = { getSeasons, getCurrentSeason, createSeason, updateSeason, deleteSeason };
