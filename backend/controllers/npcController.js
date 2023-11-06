const { StatusCodes } = require('http-status-codes');
const { Npc } = require('../models');

// @desc    Creates NPC
// route    POST /api/v1/npc
// @access  Private --- Super Admin
const createNpc = async (req, res) => {
    const { name, type } = req.body;
    if (!name) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`Please fill out all required fields.`);
    }
    const npc = new Npc({
        name,
        type,
    });
    await npc.save();
    res.status(StatusCodes.CREATED).json({ npc });
};

// @desc    Grabs all existing NPCs
// route    GET /api/v1/npc
// @access  Private --- Admin
const getAllNpcs = async (req, res) => {
    const npcs = await Npc.find({}).select('-__v').sort('name');
    res.status(StatusCodes.OK).json({ count: npcs.length, npcs });
};

// @desc    Updates existing NPC
// route    PUT /api/v1/npc/:npcId
// @access  Private --- Super Admin
const updateNpc = async (req, res) => {
    const { npcId } = req.params;
    const { name, type } = req.body;
    const filter = { _id: npcId }
    const npc = await Npc.findOneAndUpdate(
        filter,
        { name, type },
        { new: true }
    );
    if (!npc) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No NPC found with an id of ${npcId}.`);
    }
    res.status(StatusCodes.OK).json({ npc });
};

// @desc    Deletes existing NPC
// route    PUT /api/v1/npc/:npcId
// @access  Private --- Super Admin
const deleteNpc = async (req, res) => {
    const { npcId } = req.params;
    const mob = await Npc.findByIdAndDelete(npcId);
    if (!mob) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No NPC found with an id of ${npcId}.`);
    }
    res.status(StatusCodes.OK).json({ msg: `NPC deleted.` })
};

module.exports = {
    createNpc,
    getAllNpcs,
    updateNpc,
    deleteNpc,
};