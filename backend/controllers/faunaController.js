const { StatusCodes } = require('http-status-codes');
const { Fauna } = require('../models');

// @desc    Create Fauna
// @route   POST /api/v1/mount
// @access  Private (Super Admin)
const createFauna = async (req, res) => {
  const { name, species, description, behavior, habitat, interactions } = req.body;

  if (!name || !species || !description || !behavior || !habitat || !interactions) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const fauna = new Fauna({
    name,
    species,
    description,
    behavior,
    habitat,
    interactions
  });

  await fauna.save();
  res.status(StatusCodes.CREATED).json({ fauna });
};

// why no description steve? underneath
// @desc    Get all Faunas
// @route   GET /api/v1/fauna
// @access  Private (Admin)
const getAllFaunas = async (req, res) => {
  const { name, species, description, behavior, habitat, interactions, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    // $options: 'i' is non-case sensitive
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (species) {
    queryObject.species = species;
  }
  if (description) {
    queryObject.description = { $regex: description, $options: 'i' };
  }
  if (behavior) {
    queryObject.behavior = { $regex: behavior, $options: 'i' };
  }
  if (habitat) {
    queryObject.habitat = { $regex: habitat, $options: 'i' };
  }
  if (interactions) {
    queryObject.interactions = { $regex: interactions, $options: 'i' };
  }

  let result = Fauna.find(queryObject);
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
  const faunas = await result;
  res.status(StatusCodes.OK).json({ count: faunas.length, faunas });
};

// @desc    Update Fauna
// @route   PUT /api/v1/fauna/:faunaId
// @access  Private (Super Admin)
const updateFauna = async (req, res) => {
  const { faunaId } = req.params;
  const { name, species, description, behavior, habitat, interactions } = req.body;

  // For required fields
  if (name === '' || species == '' || description === ''|| behavior == '' || habitat === '' || interactions === '') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: faunaId }
  const fauna = await Fauna.findOneAndUpdate(
      filter,
      { name, species, description, behavior, habitat, interactions },
      { new: true }
  );

  if (!fauna) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No fauna found with an ID of ${faunaId}.`);
  }

  res.status(StatusCodes.OK).json({ fauna });
};

// @desc    Delete Fauna
// @route   DELETE /api/v1/fauna/:faunaId
// @access  Private (Super Admin)
const deleteFauna = async (req, res) => {
  const { faunaId } = req.params;
  const fauna = await Fauna.findByIdAndDelete(faunaId);

  if (!fauna) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No Fauna found with an ID of ${faunaId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'Fauna deleted successfully.' });
};

module.exports = {
  createFauna,
  getAllFaunas,
  updateFauna,
  deleteFauna,
};