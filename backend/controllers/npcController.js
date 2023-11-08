const Npc = require('../models/Npc'); // Make sure to specify the correct path to your model

// Controller for NPCs
const npcController = {
  createNpc: async (req, res) => {
    try {
      const npc = await Npc.create(req.body);
      return res.status(201).json(npc);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while creating an NPC.' });
    }
  },

  getAllNpcs: async (req, res) => {
    try {
      const npcs = await Npc.find();
      return res.json(npcs);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while fetching NPCs.' });
    }
  },

  updateNpc: async (req, res) => {
    const { npcId } = req.params;

    try {
      const updatedNpc = await Npc.findByIdAndUpdate(npcId, req.body, { new: true });
      if (!updatedNpc) {
        return res.status(404).json({ error: 'NPC not found.' });
      }
      return res.json(updatedNpc);
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while updating an NPC.' });
    }
  },

  deleteNpc: async (req, res) => {
    const { npcId } = req.params;

    try {
      const deletedNpc = await Npc.findByIdAndDelete(npcId);
      if (!deletedNpc) {
        return res.status(404).json({ error: 'NPC not found.' });
      }
      return res.json({ message: 'NPC deleted successfully.' });
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while deleting an NPC.' });
    }
  },
};

module.exports = npcController;
