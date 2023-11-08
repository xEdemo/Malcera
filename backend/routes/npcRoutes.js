const express = require('express');
const router = express.Router();
const { createNpc, getAllNpcs, updateNpc, deleteNpc } = require('../controllers/npcController');

// Create a new NPC
router.post('/', createNpc);

// Get all NPCs
router.get('/', getAllNpcs);

// Update an NPC by ID
router.put('/:npcId', updateNpc);

// Delete an NPC by ID
router.delete('/:npcId', deleteNpc);

module.exports = router;
