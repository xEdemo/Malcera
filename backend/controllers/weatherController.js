const { StatusCodes } = require('http-status-codes');
const { Weather } = require('../models');

// @desc    Create Weather
// @route   POST /api/v1/weather
// @access  Private (Super Admin)
const createWeather = async (req, res) => {
  const { type, description, effects } = req.body;

  if (!type || !description || !effects ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const weather = new Weather({
    type,
    description,
    effects,
  });

  await weather.save();
  res.status(StatusCodes.CREATED).json({ weather });
};

// @desc    Get all Weathers
// @route   GET /api/v1/weather
// @access  Private (Admin)
const getAllWeathers = async (req, res) => {
  const { type, description, effects, sort, fields } = req.query;
  const queryObject = {};
  if (type) {
    // $options: 'i' is non-case sensitive
    queryObject.type = { $regex: type, $options: 'i' };
  }
  if (description) {
    queryObject.description = description;
  }
  if (effects) {
    queryObject.effects = { $regex: effects, $options: 'i' };
  }

  let result = Weather.find(queryObject);
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
  const weathers = await result;
  res.status(StatusCodes.OK).json({ count: weathers.length, weathers });
};

// @desc    Update Weather
// @route   PUT /api/v1/weather/:weatherId
// @access  Private (Super Admin)
const updateWeather = async (req, res) => {
  const { weatherId } = req.params;
  const { type, description, effects } = req.body;

  // For required fields
  if (type === '' || description === '' || effects === '' ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: weatherId }
  const weather = await Weather.findOneAndUpdate(
      filter,
      { type, description, effects },
      { new: true }
  );

  if (!weather) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No weather found with an ID of ${weatherId}.`);
  }

  res.status(StatusCodes.OK).json({ weather });
};

// @desc    Delete Weather
// @route   DELETE /api/v1/weather/:weatherId
// @access  Private (Super Admin)
const deleteWeather = async (req, res) => {
  const { weatherId } = req.params;
  const weather = await Weather.findByIdAndDelete(weatherId);

  if (!weather) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No Weather found with an ID of ${weatherId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'Weather deleted successfully.' });
};

module.exports = {
  createWeather,
  getAllWeathers,
  updateWeather,
  deleteWeather,
};
