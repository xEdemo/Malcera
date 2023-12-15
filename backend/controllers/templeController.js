const { StatusCodes } = require('http-status-codes');
const { Temple } = require('../models');

// @desc    Create Temple
// @route   POST /api/v1/temple
// @access  Private (Super Admin)
const createTemple = async (req, res) => {
  const { name, description, location, deity, capacity, clergy, services } = req.body;

  if (!name || !description || !location || !deity || !capacity || !clergy || !services) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const temple = new Temple({
    name,
    description,
    location,
    deity,
    capacity,
    clergy,
    services,
  });

  await temple.save();
  res.status(StatusCodes.CREATED).json({ temple });
};

// @desc    Get all Temples
// @route   GET /api/v1/temple
// @access  Private (Admin)
const getAllTemples = async (req, res) => {
  const { name, description, location, deity, capacity, clergy, services, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    // $options: 'i' is non-case sensitive
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (description) {
    queryObject.description = description;
  }
  if (location) {
    queryObject.location = { $regex: location, $options: 'i' };
  }
  if (deity) {
    queryObject.deity = { $regex: deity, $options: 'i' };
  }
  if (capacity) {
    queryObject.capacity = { $regex: capacity, $options: 'i' };
  }
  if (clergy) {
    queryObject.clergy = { $regex: clergy, $options: 'i' };
  }
  if (services) {
    queryObject.services = { $regex: services, $options: 'i' };
  }

  let result = Temple.find(queryObject);
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
  const temples = await result;
  res.status(StatusCodes.OK).json({ count: temples.length, temples });
};

// @desc    Update Temple
// @route   PUT /api/v1/temple/:templeId
// @access  Private (Super Admin)
const updateTemple = async (req, res) => {
  const { templeId } = req.params;
  const { name, description, location, deity, capacity, clergy, services } = req.body;

  // For required fields
  if (name === '' || description === '' || location === '' || deity === ''|| capacity === ''|| clergy === ''|| services === '') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: templeId }
  const temple = await Temple.findOneAndUpdate(
      filter,
      { name, description, location, deity, capacity, clergy, services,  },
      { new: true }
  );

  if (!temple) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No temple found with an ID of ${templeId}.`);
  }

  res.status(StatusCodes.OK).json({ temple });
};

// @desc    Delete Temple
// @route   DELETE /api/v1/temple/:templeId
// @access  Private (Super Admin)
const deleteTemple = async (req, res) => {
  const { templeId } = req.params;
  const temple = await Temple.findByIdAndDelete(templeId);

  if (!temple) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No Temple found with an ID of ${templeId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'Temple deleted successfully.' });
};

module.exports = {
  createTemple,
  getAllTemples,
  updateTemple,
  deleteTemple,
};
