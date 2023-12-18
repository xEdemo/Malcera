const { StatusCodes } = require('http-status-codes');
const { NaturalDisaster } = require('../models');

// @desc    Create NaturalDisaster
// @route   POST /api/v1/naturalDisaster
// @access  Private (Super Admin)
const createNaturalDisaster = async (req, res) => {
  const { name, description, type, location, severity, startTime, endTime, affectedAreas } = req.body;

  if (!name || !description || !type || !location || !severity || !startTime || !endTime || !affectedAreas) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const naturalDisaster = new NaturalDisaster({
    name,
    description,
    type,
    location,
    severity,
    startTime,
    endTime,
    affectedAreas,
  });

  await naturalDisaster.save();
  res.status(StatusCodes.CREATED).json({ naturalDisaster });
};

// why no description steve? underneath
// @desc    Get all NaturalDisasters
// @route   GET /api/v1/naturalDisaster
// @access  Private (Admin)
const getAllNaturalDisasters = async (req, res) => {
  const { name, description, type, location, severity, startTime, endTime, affectedAreas, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    // $options: 'i' is non-case sensitive
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (description) {
    queryObject.description = description;
  }
  if (type) {
    queryObject.type = { $regex: type, $options: 'i' };
  }
  if (location) {
    queryObject.location = { $regex: location, $options: 'i' };
  }
  if (severity) {
    queryObject.severity = { $regex: severity, $options: 'i'}
  }
  if (startTime) {
    queryObject.startTime = { $regex: startTime, $options: 'i'}
  }
  if (endTime) {
    queryObject.endTime = { $regex: endTime, $options: 'i'}
  }
  if (affectedAreas) {
    queryObject.affectedAreas = { $regex: affectedAreas, $options: 'i'}
  }

  let result = NaturalDisaster.find(queryObject);
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
  const naturalDisasters = await result;
  res.status(StatusCodes.OK).json({ count: naturalDisasters.length, naturalDisasters });
};

// @desc    Update Mount
// @route   PUT /api/v1/mount/:mountId
// @access  Private (Super Admin)
const updateNaturalDisaster = async (req, res) => {
  const { naturalDisasterId } = req.params;
  const { name, description, type, location, severity, startTime, endTime, affectedAreas } = req.body;

  // For required fields
  if (name === '' || description === '' || type === '' || location === ''|| severity === ''|| startTime === ''|| endTime === ''|| affectedAreas === '') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: naturalDisasterId }
  const naturalDisaster = await NaturalDisaster.findOneAndUpdate(
      filter,
      { name, description, type, location, severity, startTime, endTime, affectedAreas },
      { new: true }
  );

  if (!naturalDisaster) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No naturalDisaster found with an ID of ${naturalDisasterId}.`);
  }

  res.status(StatusCodes.OK).json({ naturalDisaster });
};

// @desc    Delete NaturalDisaster
// @route   DELETE /api/v1/naturalDisaster/:naturalDisasterId
// @access  Private (Super Admin)
const deleteNaturalDisaster = async (req, res) => {
  const { naturalDisasterId } = req.params;
  const naturalDisaster = await NaturalDisaster.findByIdAndDelete(naturalDisasterId);

  if (!naturalDisaster) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No NaturalDisaster found with an ID of ${naturalDisasterId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'NaturalDisaster deleted successfully.' });
};

module.exports = {
  createNaturalDisaster,
  getAllNaturalDisasters,
  updateNaturalDisaster,
  deleteNaturalDisaster,
};