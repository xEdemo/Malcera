const { StatusCodes } = require('http-status-codes');
const { LostLanguage } = require('../models');

// @desc    Create LostLanguage
// @route   POST /api/v1/lostLanguage
// @access  Private (Super Admin)
const createLostLanguage = async (req, res) => {
  const { name, description, symbols, diffuculty } = req.body;

  if (!name || !description|| !symbols || !diffuculty) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const lostLanguage = new LostLanguage({
    name,
    description,
    symbols,
    diffuculty,
  });

  await lostLanguage.save();
  res.status(StatusCodes.CREATED).json({ lostLanguage });
};

// why no description steve? underneath
// @desc    Get all Mounts
// @route   GET /api/v1/mount
// @access  Private (Admin)
const getAllLostLanguages = async (req, res) => {
  const { name, description, symbols, diffuculty, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    // $options: 'i' is non-case sensitive
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (description) {
    queryObject.description = description;
  }
  if (symbols) {
    queryObject.symbols = { $regex: symbols, $options: 'i' };
  }
  if (diffuculty) {
    queryObject.diffuculty = { $regex: diffuculty, $options: 'i'};
  }

  let result = LostLanguage.find(queryObject);
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
  const lostLanguages = await result;
  res.status(StatusCodes.OK).json({ count: lostLanguages.length, lostLanguages });
};

// @desc    Update LostLanguage
// @route   PUT /api/v1/lostLanguage/:lostLanguageId
// @access  Private (Super Admin)
const updateLostLanguage = async (req, res) => {
  const { lostLanguageId } = req.params;
  const { name, description, symbols, diffuculty } = req.body;

  // For required fields
  if (name === '' || description === '' || symbols === '' || diffuculty === '') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: lostLanguageId }
  const lostLanguage = await LostLanguage.findOneAndUpdate(
      filter,
      { name, description, symbols, diffuculty },
      { new: true }
  );

  if (!lostLanguage) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No mount found with an ID of ${lostLanguageId}.`);
  }

  res.status(StatusCodes.OK).json({ lostLanguage });
};

// @desc    Delete LostLanguagge
// @route   DELETE /api/v1/lostLanguage/:lostLanguageId
// @access  Private (Super Admin)
const deleteLostLanguage = async (req, res) => {
  const { lostLanguageId } = req.params;
  const lostLanguage = await LostLanguage.findByIdAndDelete(lostLanguageId);

  if (!lostLanguage) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No LostLanguage found with an ID of ${lostLanguageId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'LostLanguage deleted successfully.' });
};

module.exports = {
  createLostLanguage,
  getAllLostLanguages,
  updateLostLanguage,
  deleteLostLanguage,
};