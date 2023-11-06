const mongoose = require('mongoose');

const NpcSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        type: {
            type: [String],
            enum: ['Trader', 
            'Quest Giver', 
            'Innkeeper', 
            'Merchant', 
            'Shopkeeper', 
            'Town Guard', 
            'Crafter', 
            'Blacksmith', 
            'Historical Chacter', 
            'Random Encounter', 
            'Lore Keeper', 
            'Alchemist', 
            'Jeweler', 
            'Leather Worker', 
            'Carpenter', 
            'Steve'],
            default: 'Steve'
        }, 
    },
    {timestamps: true}
)

const Npc = mongoose.model('Npc', NpcSchema);

module.exports = Npc;