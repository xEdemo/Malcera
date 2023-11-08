const LostLanguage = require('../models/LostLanguage'); // Import your Lost Language model

const createLostLanguage = async (req, res) => {
  try {
    const lostLanguage = await LostLanguage.create(req.body);
    return res.status(201).json(lostLanguage);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the Lost Language.' });
  }
};

const getAllLostLanguages = async (req, res) => {
  try {
    const lostLanguages = await LostLanguage.find();
    return res.json(lostLanguages);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching Lost Languages.' });
  }
};

const updateLostLanguage = async (req, res) => {
  try {
    const lostLanguage = await LostLanguage.findByIdAndUpdate(req.params.languageId, req.body, { new: true });
    if (!lostLanguage) {
      return res.status(404).json({ error: 'Lost Language not found.' });
    }
    return res.json(lostLanguage);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating the Lost Language.' });
  }
};

const deleteLostLanguage = async (req, res) => {
  try {
    const lostLanguage = await LostLanguage.findByIdAndDelete(req.params.languageId);
    if (!lostLanguage) {
      return res.status(404).json({ error: 'Lost Language not found.' });
    }
    return res.json({ message: 'Lost Language deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the Lost Language.' });
  }
};

module.exports = { createLostLanguage, getAllLostLanguages, updateLostLanguage, deleteLostLanguage };
