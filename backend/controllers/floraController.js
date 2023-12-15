const { StatusCodes } = require('http-status-codes');
const { Flora } = require('../models');

// @desc    Create Flora
// @route   POST /api/v1/flora
// @access  Private (Super Admin)
const createFlora = async (req, res) => {
  const { name, type, description, rarity, properties } = req.body;

  if (!name || !type || !description || !rarity || !properties ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const flora = new Flora({
    name,
    type,
    description,
    rarity,
    properties,
  });

  await flora.save();
  res.status(StatusCodes.CREATED).json({ flora });
};

// why no description steve? underneath
// @desc    Get all Floras
// @route   GET /api/v1/flora
// @access  Private (Admin)
const getAllFloras = async (req, res) => {
  const { name, type, description, rarity, properties, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    // $options: 'i' is non-case sensitive
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (type) {
    queryObject.type = type;
  }
  if (description) {
    queryObject.description = { $regex: description, $options: 'i' };
  }
  if (rarity) {
    queryObject.rarity = { $regex: rarity, $options: 'i' };
  }
  if (properties) {
    queryObject.properties = { $regex: properties, $options: 'i' };
  }

  let result = Flora.find(queryObject);
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
  const floras = await result;
  res.status(StatusCodes.OK).json({ count: floras.length, floras });
};

// @desc    Update Mount
// @route   PUT /api/v1/mount/:mountId
// @access  Private (Super Admin)
const updateFlora = async (req, res) => {
  const { floraId } = req.params;
  const { name, type, description, rarity, properties } = req.body;

  // For required fields
  if (name === '' || type === '' || description === '' || rarity === '' || properties === '') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: floraId }
  const flora = await Flora.findOneAndUpdate(
      filter,
      { name, type, description, rarity, properties },
      { new: true }
  );

  if (!flora) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No flora found with an ID of ${floraId}.`);
  }

  res.status(StatusCodes.OK).json({ flora });
};

// @desc    Delete Flora
// @route   DELETE /api/v1/flora/:floraId
// @access  Private (Super Admin)
const deleteFlora = async (req, res) => {
  const { floraId } = req.params;
  const flora = await Flora.findByIdAndDelete(floraId);

  if (!flora) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No Flora found with an ID of ${floraId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'Flora deleted successfully.' });
};

module.exports = {
  createFlora,
  getAllFloras,
  updateFlora,
  deleteFlora,
};