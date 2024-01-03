const mongoose = require('mongoose');

// Define the ReligiousCovenant schema
const ReligiousCovenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Ensure that names are unique
    },
    description: {
        type: String,
        required: true,
    },
    material: {
        type: String,               // prob needs material gold standard to be able to accept material idfk
        required: true,
    },
    religiousOrder: {               // needs to be changged to only acccept RO
        type: String,
        required: true,
    },
    rarity: {                       // think of a reason why rarity is necessecary, prob doesnt need tho
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], // Use enum to restrict values
        required: true,
    }

});

// Create the ReligiousCovenant model
const ReligiousCovenant = mongoose.model('ReligiousCovenant', ReligiousCovenantSchema);

module.exports = ReligiousCovenant;


// handles ReligiousCovenants for roonie the retard