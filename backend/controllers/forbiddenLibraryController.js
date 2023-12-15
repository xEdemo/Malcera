const { StatusCodes } = require('http-status-codes');
const { ForbiddenLibrary } = require('../models');

// @desc    Create Forbidden Library
// @route   POST /api/v1/forbiddenLibrary
// @access  Private (Super Admin)
const createForbiddenLibrary = async (req, res) => {
  const { name, location, guardian, contents, questRequired, moralAlignment } = req.body;

  const forbiddenLibrary = new ForbiddenLibrary({
    name,
    location,
    guardian,
    contents,
    questRequired,
    moralAlignment,
  });

  await forbiddenLibrary.save();
  res.status(StatusCodes.CREATED).json({ forbiddenLibrary });
};

// why no description steve? underneath
// @desc    Get all Forbidden Libraries
// @route   GET /api/v1/forbiddenLibrary
// @access  Private (Admin)
const getAllForbiddenLibraries = async (req, res) => {
  const { name, location, guardian, contents, questRequired, moralAlignment, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    // $options: 'i' is non-case sensitive
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (location) {
    queryObject.location = location;
  }
  if (guardian) {
    queryObject.guardian = { $regex: guardian, $options: 'i' };
  }
  if (contents) {
    queryObject.contents = { $regex: contents, $options: 'i' };
  }
  if (questRequired) {
    queryObject.questRequired = { $regex: questRequired, $options: 'i' };
  }
  if (moralAlignment) {
    queryObject.moralAlignment = { $regex: moralAlignment, $options: 'i' };

  }

  let result = ForbiddenLibrary.find(queryObject);
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
  const forbiddenLibraries = await result;
  res.status(StatusCodes.OK).json({ count: forbiddenLibraries.length, forbiddenLibraries });
};

// @desc    Update ForbiddenLibrary
// @route   PUT /api/v1/forbiddenLibrary/:forbiddenLibraryId
// @access  Private (Super Admin)
const updateForbiddenLibrary = async (req, res) => {
  const { forbiddenLibraryId } = req.params;
  const { name, location, guardian, contents, questRequired, moralAlignment } = req.body;

  // For required fields
  if (name === '' || location === '' || guardian === '' || contents === ''|| questRequired === ''|| moralAlignment === '') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: forbiddenLibraryId }
  const forbiddenLibrary = await ForbiddenLibrary.findOneAndUpdate(
      filter,
      { name, location, guardian, contents, questRequired, moralAlignment },
      { new: true }
  );

  if (!forbiddenLibrary) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No forbiddenLibrary found with an ID of ${forbiddenLibraryId}.`);
  }

  res.status(StatusCodes.OK).json({ forbiddenLibrary });
};

// @desc    Delete Forbidden Library
// @route   DELETE /api/v1/forbiddenLibrary/:forbiddenLibraryId
// @access  Private (Super Admin)
const deleteForbiddenLibrary = async (req, res) => {
  const { forbiddenLibraryId } = req.params;
  const forbiddenLibrary = await ForbiddenLibrary.findByIdAndDelete(forbiddenLibraryId);

  if (!forbiddenLibrary) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No forbiddenLibrary found with an ID of ${forbiddenLibraryId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'forbiddenLibrary deleted successfully.' });
};

module.exports = {
  createForbiddenLibrary,
  getAllForbiddenLibraries,
  updateForbiddenLibrary,
  deleteForbiddenLibrary,
};