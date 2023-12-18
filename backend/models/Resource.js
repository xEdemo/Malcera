const mongoose = require('mongoose');

// Define Enums
const ResourceTypes = ['Trees', 'Ore', 'Plants', 'Fish', 'Gems', 'Fossils', 'Bushes'];
const ResourceTiers = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];

const TreeTypes = ['Charred Emberwood', 'Sinister Shadowoak', 'Infernal Bloodpine', 'Abyssal Dreadwood', 'Cursed Ghostwillow'];
const OreTypes = ['Charred Ore', 'Sinister Vein', 'Infernal Shard', 'Abyssal Iron', 'Cursed Crystal'];
const PlantTypes = ['Charred Bramble', 'Sinister Vine', 'Infernal Herb', 'Abyssal Blossom', 'Cursed Nightshade'];
const FishTypes = ['Charred Eel', 'Sinister Anglerfish', 'Infernal Serpentfish', 'Abyssal Salmon', 'Cursed Clawfish'];
const GemTypes = ['Charred Doomstone', 'Sinister Opal', 'Infernal Ruby', 'Abyssal Emerald', 'Cursed Onyx'];
const FossilTypes = ['Charred Bone Fragment', 'Sinister Fossilized Remains', 'Abyssal Shell', 'Abyssal Trilobite', 'Cursed Dinosaur Bone'];
const BushTypes = ['Charred Bush', 'Sinister Grove', 'Infernal Thicket', 'Abyssal Tangle', 'Cursed Thornbush'];

// Create Resource Schema
const resourceSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ResourceTypes,
    },
    resourceType: {
        type: [String],
        validate: {
            validator: function (value) {
                const validTypes = {
                    Trees: TreeTypes,
                    Ore: OreTypes,
                    Plants: PlantTypes,
                    Fish: FishTypes,
                    Gems: GemTypes,
                    Fossils: FossilTypes,
                    Bushes: BushTypes,
                };
                return value.every((item) => validTypes[this.type].includes(item));
            },
            message: props => `${props.value} is not a valid resource type for the specified category.`,
        },
    },
    tier: {
        type: String,
        enum: ResourceTiers,
    },
    // ... other properties
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
