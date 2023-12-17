const mongoose = require('mongoose');

// Define the Artifact schema
const ArtifactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Ensure that names are unique
    },
    description: {
        type: String,
        required: true,
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], // Use enum to restrict values
        required: true,
    },
    alignment: {
        type: String,
        required: true,
    },
    religiousOrder: {
        type: String,
        required: true,
    },
    materialComposition: {
        type: String,
        required: true,
    },
    timeSensitivity: {
        type: String,
        required: true,
    },
    enhancement: {
        type: String,
        required: true,
    },
    durability: {
        type: String,
        required: true,
    },
    curses: {
        type: String,
        required: true,
    },
    effects: {
        type: String,
        required: true,
    },



});

// Create the Artifact model
const Artifact = mongoose.model('Artifact', ArtifactSchema);

module.exports = Artifact;


// handles artifacts for roonie the retard
// add a tier or rarity system
// possibly add guardianship attribute
// possibly add quest dependancy
//