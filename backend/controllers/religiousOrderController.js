const { StatusCodes } = require('http-status-codes');
const { ReligiousOrder } = require('../models');

// @desc    Create ReligiousOrder
// @route   POST /api/v1/religiousOrder
// @access  Private (Super Admin)
const createReligiousOrder = async (req, res) => {
  const { name, deity, description, alignment, members, headquarters, temples, rivals, alliances, leader  } = req.body;

  if (!name || !deity || !description || !alignment|| !members ||!headquarters ||!temples ||!rivals ||!alliances ||!leader ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const religiousOrder = new ReligiousOrder({
    name,
    deity,
    description,
    alignment,
    members,
    headquarters,
    temples,
    rivals,
    alliances,
    leader,
  });

  await religiousOrder.save();
  res.status(StatusCodes.CREATED).json({ religiousOrder });
};

// @desc    Get all ReligiousOrders
// @route   GET /api/v1/religiousOrder
// @access  Private (Admin)
const getAllReligiousOrders= async (req, res) => {
  const { name, deity, description, alignment, members, headquarters, temples, rivals, alliances, leader, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    // $options: 'i' is non-case sensitive
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (deity) {
    queryObject.deity = deity;
  }
  if (description) {
    queryObject.description = { $regex: description, $options: 'i' };
  }
  if (alignment) {
    queryObject.alignment = { $regex: alignment, $options: 'i' };
  }
  if (members) {
    queryObject.members = { $regex: members, $options: 'i' };
  }
  if (headquarters) {
    queryObject.headquarters = { $regex: headquarters, $options: 'i' };
  }
  if (temples) {
    queryObject.temples = { $regex: temples, $options: 'i' };
  }
  if (rivals) {
    queryObject.rivals = { $regex: rivals, $options: 'i' };
  }
  if (alliances) {
    queryObject.alliances = { $regex: alliances, $options: 'i' };
  }
  if (leader) {
    queryObject.leader = { $regex: leader, $options: 'i' };
  }

  let result = ReligiousOrder.find(queryObject);
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
  const religiousOrders = await result;
  res.status(StatusCodes.OK).json({ count: religiousOrders.length, religiousOrders });
};

// @desc    Update ReligiousOrder
// @route   PUT /api/v1/religiousOrder/:religiousOrderId
// @access  Private (Super Admin)
const updateReligiousOrder = async (req, res) => {
  const { religiousOrderId } = req.params;
  const { name, deity, description, alignment, members, headquarters, temples, rivals, alliances, leader } = req.body;

  // For required fields
  if (name === '' || deity ==='' || description === '' || alignment ==='' || members ==='' || headquarters === '' || temples === '' || rivals ==='' || alliances === '' || leader === '') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: religiousOrderId }
  const religiousOrder = await ReligiousOrder.findOneAndUpdate(
      filter,
      { name, deity, description, alignment, members, headquarters, temples, rivals, alliances, leader },
      { new: true }
  );

  if (!religiousOrder) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No religiousOrder found with an ID of ${religiousOrderId}.`);
  }

  res.status(StatusCodes.OK).json({ religiousOrder });
};

// @desc    Delete ReligiousOrder
// @route   DELETE /api/v1/religiousOrder/:religiousOrderId
// @access  Private (Super Admin)
const deleteReligiousOrder = async (req, res) => {
  const { religiousOrderId } = req.params;
  const religiousOrder = await ReligiousOrder.findByIdAndDelete(religiousOrderId);

  if (!religiousOrder) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No ReligiousOrder found with an ID of ${religiousOrderId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'ReligiousOrder deleted successfully.' });
};

module.exports = {
  createReligiousOrder,
  getAllReligiousOrders,
  updateReligiousOrder,
  deleteReligiousOrder,
};
