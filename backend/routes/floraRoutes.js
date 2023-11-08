const express = require('express');
const router = express.Router();
const floraController = require('../controllers/floraController'); // Import your flora controller

const {
    createFlora,
    updateFlora,
    deleteFlora,
  } = require('../controllers/floraController');
  
  // Create a new flora
  router.post('/', createFlora);
  
  // Update existing flora
  router.put('/:floraId', updateFlora);
  
  // Delete flora
  router.delete('/:floraId', deleteFlora);
  
  module.exports = router;
