const { StatusCodes } = require('http-status-codes');
const { ReligiousEvent } = require('../models');

// @desc    Create ReligiousEvent
// @route   POST /api/v1/religiousEvent
// @access  Private (Super Admin)
const createReligiousEvent = async (req, res) => {
  const { name, description, type, date, location, participants, religiousOrder } = req.body;

  if (!name || !description || !type || !date || !location || !participants || !religiousOrder) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const religiousEvent = new ReligiousEvent({
    name,
    description,
    type,
    date,
    location,
    participants,
    religiousOrder,
  });

  await religiousEvent.save();
  res.status(StatusCodes.CREATED).json({ religiousEvent });
};

// @desc    Get all ReligiousEvents
// @route   GET /api/v1/religiousEvent
// @access  Private (Admin)
const getAllReligiousEvents = async (req, res) => {
  const { name, description, type, date, location, participants, religiousOrder, sort, fields } = req.query;
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

  if (date) {
    queryObject.date = { $regex: date, $options: 'i'};
  }

  if (location) {
    queryObject.location = { $regex: location, $options: 'i'};
  }

  if (participants) {
    queryObject.participants = { $regex: participants, $options: 'i'};
  }

  if (religiousOrder) {
    queryObject.religiousOrder = { $regex: religiousOrder, $options: 'i'};
  }

  let result = ReligiousEvent.find(queryObject);

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
  const religiousEvents = await result;
  res.status(StatusCodes.OK).json({ count: religiousEvents.length, religiousEvents });
};

// @desc    Update ReligiousEvent
// @route   PUT /api/v1/religiousEvent/:religiousEventId
// @access  Private (Super Admin)
const updateReligiousEvent = async (req, res) => {
  const { religiousEventId } = req.params;
  const { name, description,type, date, location, participants, religiousOrder } = req.body;

  // For required fields
  if (name === '' || description === '' || type === '' || date === ''|| location === ''|| participants === ''|| religiousOrder === '') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: religiousEventId }
  const religiousEvent = await ReligiousEvent.findOneAndUpdate(
      filter,
      { name, description, type, date, location, participants, religiousOrder },
      { new: true }
  );

  if (!religiousEvent) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No mount found with an ID of ${religiousEventId}.`);
  }

  res.status(StatusCodes.OK).json({ religiousEvent });
};

// @desc    Delete ReligiousEvent
// @route   DELETE /api/v1/religiousEvent/:religiousEventid
// @access  Private (Super Admin)
const deleteReligiousEvent = async (req, res) => {
  const { religiousEventId } = req.params;
  const religiousEvent = await ReligiousEvent.findByIdAndDelete(religiousEventId);

  if (!religiousEvent) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No ReligiousEvent found with an ID of ${religiousEventId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'ReligiousEvent deleted successfully.' });
};

module.exports = {
  createReligiousEvent,
  getAllReligiousEvents,
  updateReligiousEvent,
  deleteReligiousEvent,
};
