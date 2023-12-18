const { StatusCodes } = require('http-status-codes');
const { Bank } = require('../models');

// @desc    Create Bank
// @route   POST /api/v1/bank
// @access  Private (Super Admin)
const createBank = async (req, res) => {
  const { name, location, services, currency, vaultCapacity, securityLevel, openHours } = req.body;

  if (!name || !location || !services || !currency || !vaultCapacity || !securityLevel || !openHours) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const bank = new Bank({
    name,
    location,
    services,
    currency,
    vaultCapacity,
    securityLevel,
    openHours,
  });

  await bank.save();
  res.status(StatusCodes.CREATED).json({ bank });
};

// @desc    Get all Banks
// @route   GET /api/v1/bank
// @access  Private (Admin)
const getAllBanks = async (req, res) => {
  const { name, location, services, currency, vaultCapacity, securityLevel, openHours, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    // $options: 'i' is non case sensitive
    queryObject.name = { $regex: name, $options: 'i' };

  }
  if (location) {
    queryObject.location = location;
  }
  if (services) {
    queryObject.services = { $regex: services, $options: 'i'};
  }
  if (currency) {
    queryObject.currency = currency;
  }

  if (vaultCapacity) {
    queryObject.vaultCapacity = vaultCapacity;
  }
  if (securityLevel) {
    queryObject.securityLevel = securityLevel;
  }
  if (openHours) {
    queryObject.openHours = openHours;
  }

  let result = Bank.find(queryObject);
  // sort
  if (sort) {
    const sortList = sort.split(',').join(' ');
    result = result.sort(sortList);
  } else {
    result = result.sort('createdAt');
  }
  // fields
  if (fields) {
    const fieldsList = fields.split(',').join(' ');
    result = result.select(fieldsList);
  }
  // sets defaults if not specified
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  const banks = await result;
  res.status(StatusCodes.OK).json({ count: banks.length, banks});
}

// @desc    Update Bank
// @route   PUT /api/v1/bank/:bankId
// @access  Private (Super Admin)
const updateBank = async (req, res) => {
  const { bankId } = req.params;
  const { name, location, services, currency, vaultCapacity, securityLevel, openHours } = req.body;

  // For required fields
  if (name === '' || location === '' || services === '' || currency === '' || vaultCapacity === '' || securityLevel === '' || openHours === '') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields

  const filter = { _id: bankId };
  const bank = await Bank.findOneAndUpdate(
      filter,
      { name, location, services, currency, vaultCapacity, securityLevel, openHours },
      { new: true }
  );

  if (!bank) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No bank found with an ID of ${bankId}.`);
  }

  res.status(StatusCodes.OK).json({ bank });
};

// @desc    Delete Bank
// @route   DELETE /api/v1/bank/:bankId
// @access  Private (Super Admin)
const deleteBank = async (req, res) => {
  const { bankId } = req.params;
  const bank = await Bank.findByIdAndDelete(bankId);

  if (!bank) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No Bank found with an ID of ${bankId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'Bank deleted successfully.' });
};

module.exports = {
  createBank,
  getAllBanks,
  updateBank,
  deleteBank,
};