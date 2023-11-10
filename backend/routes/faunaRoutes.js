const express = require('express');
const router = express.Router();
const faunaController = require('../controllers/faunaController'); // Import your fauna controller

const {
    createFauna,
    updateFauna,
    deleteFauna,
  } = require('../controllers/faunaController');
  
  // Create a new fauna
  router.post('/', createFauna);
  
  // Update existing fauna
  router.put('/:faunaId', updateFauna);
  
  // Delete fauna
  router.delete('/:faunaId', deleteFauna);
  
  module.exports = router;