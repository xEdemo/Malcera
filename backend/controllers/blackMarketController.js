const { StatusCodes } = require('http-status-codes');
const { BlackMarket } = require('../models');

// @desc    Create BlackMarket
// @route   POST /api/v1/blackMarket
// @access  Private (Super Admin)
const createBlackMarket = async (req, res) => {
  const { name, description, location, goods, services, reputation, currencyAccepted, owner, alignment } = req.body;

  if (!name || !description || !location || !goods || !services || !reputation || !currencyAccepted || !owner || !alignment) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill out all required fields.');
  }

  const blackMarket = new BlackMarket({
    name,
    description,
    location,
    goods,
    services,
    reputation,
    currencyAccepted,
    owner,
    alignment,
  });

  await blackMarket.save();
  res.status(StatusCodes.CREATED).json({ blackMarket});

};

// @desc    Get all BlackMarkets
// @route   GET /api/v1/blackMarket
// @access  Private (Admin)
const getAllBlackMarkets = async (req, res) => {
  const { name, description, location, goods, services, reputation, currencyAccepted, owner, alignment, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    // $options: 'i' is non-case sensitive              // possible scope alignment issues
    queryObject.name = { $regex: name, $options: 'i' }; // send to roon for double check
  }
  if (description) {
    queryObject.speed = speed;
  }
  if (location) {
    queryObject.type = { $regex: type, $options: 'i' };
  }
  if (goods) {
    queryObject.type = { $regex: type, $options: 'i' };
  }
  if (services) {
    queryObject.type = { $regex: type, $options: 'i' };
  }
  if (reputation) {                           // possible INT depending on setup
    queryObject.type = { $regex: type, $options: 'i' };
  }
  if (currencyAccepted) {
    queryObject.type = { $regex: type, $options: 'i' };
  }
  if (owner) {
    queryObject.type = { $regex: type, $options: 'i' };
  }
  if (alignment) {
    queryObject.type = { $regex: type, $options: 'i' };
  }

  let result = BlackMarket.find(queryObject);
  // sort
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
  const blackMarkets = await result;
  res.status(StatusCodes.OK).json({ count: blackMarkets.length, blackMarkets });
};

// @desc    Update BlackMarket
// @route   PUT /api/v1/blackMarket/:blackMarketId
// @access  Private (Super Admin)
const updateBlackMarket = async (req, res) => {   // does this need camelcase Ivan?
  const { blackMarketId } = req.params;
  const { name, description, location, goods, services, reputation, currencyAccepted, owner, alignment } = req.body;

  // For required fields
  if (name === '' || description === '' || location === '' || goods === ''|| services === ''|| goods === ''|| reputation ===' ' || currencyAccepted || owner === '' || alignment === '') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Required fields need a number, string, object, or boolean.');
  }
  // End for required fields
  const filter = { _id: blackMarketId }
  const blackMarket = await BlackMarket.findOneAndUpdate(
      filter,
      { name, description, location, goods, services, reputation, currencyAccepted, owner, alignment },
      { new: true }
  );

  if (!blackMarket) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No blackMarket found with an ID of ${blackMarketID}.`);

  }

  res.status(StatusCodes.OK).json({ blackMarket});

};

// @desc    Delete BlackMarket
// @route   DELETE /api/v1/blackMarket/:blackMarketId
// @access  Private (Super Admin)
const deleteBlackMarket = async (req, res) => {
  const { blackMarketId } = req.params;
  const blackMarket = await BlackMarket.findByIdAndDelete(blackMarketId);

  if (!blackMarket) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`No BlackMarket found with an ID of ${blackMarketId}.`);
  }

  res.status(StatusCodes.OK).json({ message: 'BlackMarket deleted successfully.' });
};

module.exports = {
  createBlackMarket,
  getAllBlackMarkets,
  updateBlackMarket,
  deleteBlackMarket,
};