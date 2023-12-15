const { StatusCodes } = require('http-status-codes');
const { Season } = require('../models');

// @desc    Create Season
// @route   POST /api/v1/season
// @access  Private (Super Admin)
const createSeason = async (req, res) => {
  const { name, description, startMonth, endMonth, effects } = req.body;

  if (!name || !description || !startMonth || !endMonth || !effects ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const season = new Season({
    name,
    description,
    startMonth,
    endMonth,
    effects,
  });

  await season.save();
  res.status(StatusCodes.CREATED).json({ season });
};

// @desc    Get all Seasons
// @route   GET /api/v1/season
// @access  Private (Admin)
const getAllSeasons = async (req, res) => {
  const { name, description, startMonth, endMonth, effects, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    // $options: 'i' is non-case sensitive
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (description) {
    queryObject.description = description;
  }
  if (startMonth) {
    queryObject.startMonth = { $regex: startMonth, $options: 'i' };
  }
  if (endMonth) {
    queryObject.endMonth = { $regex: endMonth, $options: 'i'};
  }
  if (effects) {
    queryObject.effects = { $regex: effects, $options: 'i'};
  }

  let result = Season.find(queryObject);
  // Sort
  if (sort) {
    const sortList = sort.split(',').join(' ');
    result = result.sort(sortList);
  } else {
    result = result.sort('createdAt');
  }
  // Fields
  if (fields) {
    const fieldsList = fields.split(',').join(' ');
    result = result.select(fieldsList);
  }
  // Sets defaults if not specified
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  const seasons = await result;
  res.status(StatusCodes.OK).json({ count: seasons.length, seasons });
};

// @desc    Update Season
// @route   PUT /api/v1/season/:seasonId
// @access  Private (Super Admin)
const updateSeason = async (req, res) => {
  const { seasonId } = req.params;
  const { name, description, startMonth, endMonth, effects } = req.body;

  // For required fields
  if (name === '' || description === '' || startMonth === '' || endMonth === '' || effects ==='') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: seasonId }
  const season = await Season.findOneAndUpdate(
      filter,
      { name, description, startMonth, endMonth, effects },
      { new: true }
  );

  if (!season) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No season found with an ID of ${seasonId}.`);
  }

  res.status(StatusCodes.OK).json({ season });
};

// @desc    Delete Season
// @route   DELETE /api/v1/season/:seasonId
// @access  Private (Super Admin)
const deleteSeason = async (req, res) => {
  const { seasonId } = req.params;
  const season = await Season.findByIdAndDelete(seasonId);

  if (!season) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No Season found with an ID of ${seasonId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'Season deleted successfully.' });
};

module.exports = {
  createSeason,
  getAllSeasons,
  updateSeason,
  deleteSeason,
};
