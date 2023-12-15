const { StatusCodes } = require('http-status-codes');
const { LostTreasure } = require('../models');

// @desc    Create LostTreasure
// @route   POST /api/v1/lostTreasure
// @access  Private (Super Admin)
const createLostTreasure = async (req, res) => {
  const { name, description, value, location } = req.body;

  if (!name || !description || !value || !location) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const lostTreasure = new LostTreasure({
    name,
    description,
    value,
    location,
  });

  await lostTreasure.save();
  res.status(StatusCodes.CREATED).json({ lostTreasure });
};

// why no description steve? underneath
// @desc    Get all LostTreasures
// @route   GET /api/v1/lostTreasures
// @access  Private (Admin)
const getAllLostTreasures = async (req, res) => {
  const { name, description, value, location, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    // $options: 'i' is non-case sensitive
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (description) {
    queryObject.description = description;
  }
  if (value) {
    queryObject.value = { $regex: value, $options: 'i' };
  }
  if (location) {
    queryObject.value = { $regex: location, $options: 'i'};
  }


  let result = LostTreasure.find(queryObject);
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
  const lostTreasures = await result;
  res.status(StatusCodes.OK).json({ count: lostTreasures.length, lostTreasures });
};

// @desc    Update LostTreasure
// @route   PUT /api/v1/lostTreasures/:lostTreasuresId
// @access  Private (Super Admin)
const updateLostTreasure = async (req, res) => {
  const { lostTreasureId } = req.params;
  const { name, description, value, location } = req.body;

  // For required fields
  if (name === '' || description === '' || value === '' || location === '') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: lostTreasureId }
  const lostTreasure = await LostTreasure.findOneAndUpdate(
      filter,
      { name, description, value, location },
      { new: true }
  );

  if (!lostTreasure) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No lostTreasure found with an ID of ${lostTreasureId}.`);
  }

  res.status(StatusCodes.OK).json({ lostTreasure });
};

// @desc    Delete LostTreasure
// @route   DELETE /api/v1/lostTreasure/:lostTreasureId
// @access  Private (Super Admin)
const deleteLostTreasure = async (req, res) => {
  const { lostTreasureId } = req.params;
  const lostTreasure = await LostTreasure.findByIdAndDelete(lostTreasureId);

  if (!lostTreasure) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No LostTreasure found with an ID of ${lostTreasureId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'LostTreasure deleted successfully.' });
};

module.exports = {
  createLostTreasure,
  getAllLostTreasures,
  updateLostTreasure,
  deleteLostTreasure,
};