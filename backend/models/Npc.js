const mongoose = require('mongoose');

const NpcSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, `Please provide your desired username.`],
            minlength: 3,
            maxlength: 16,
            match: [
                /^[A-Za-z0-9]+$/,
                `Please provide a valid username. Usernames must be atleast three characters, no longer than 16 characters, and must not contain any special characters`,
            ],
            unique: true,
        },
        
        questType: {
            type: String,
            minlength: 8,
            maxlength: 60,
        },

                
        reward: {
            type: String,
            minlength: 8,
            maxlength: 60,
        },

        role: {
            type: String,
            enum: ['user', 'admin', 'superAdmin'],
            default: 'user',
        },
                        
        goods: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            maxlength: 60,
        },
                                
        currency: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            maxlength: 60,
        },
                                        
        craftableItems: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            maxlength: 60,
        },
                                                
        craftingMaterials: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            maxlength: 60,
        },
        services: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            maxlength: 60,
        },
        accomodationCost: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            maxlength: 60,
        },
        cures: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            maxlength: 60,
        },
        wares: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            maxlength: 60,
        },
        banned: {
            type: Boolean,
            default: false,
        },
        mobKills: {
            type: Number,
            default: 0,
        },
        attackLvl: {
            type: Number,
            default: 1,
        },
        attackXp: {
            type: Number,
            default: 0,
        },
        defenseLvl: {
            type: Number,
            default: 1,
        },
        defenseXp: {
            type: Number,
            default: 0,
        },
        strengthLvl: {
            type: Number,
            default: 1,
        },
        strengthXp: {
            type: Number,
            default: 0,
        },
        hitpointsLvl: {
            type: Number,
            default: 10,
        },
        hitpointsXp: {
            type: Number,
            default: 0,
        },
        healthPool: {
            type: Number,
            default: 50,
        },
        weaponPower: {
            type: Number,
            default: 1,
        },
        armourRating: {
            type: Number,
            default: 1,
        },
                                        // delete randoms?
        actionStatus: {
            type: String,
            default: 'inactive',
        },
        jossPaper: {
            type: Number,
            default: 0,
        },
        inventory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventory',
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
);


// ethics for hsitorical charcters/ morall compass? two for each level of hell? have historical charcters have ethics as variable, backstory, would need karma syste, 
// historical knowledge for hsitorical charcters?
// how to create specific mobs
// location model?
// quest model?
// flora and fauna models will interact with the crafting and gathering system, envriomental effects for flora
// endangerement model to track the status of species such as endangered threatened or extinct
// quests can involve specific flora and fauna that aharacters need to locate protect or study for specific quests
// side quests model 
// certain unique flora and fauna can be used to help build lore and indicate the health of an area 
// random encounters model
// in game currencies and currency systems
// achievement tracker and tracking system
// every level or circle has its own model?
// models to represeant portals or gateways between realms
// what about villages and towns etc
// every realm could also have punishments a user must go through, we will have a punishment and rewards system
// bounty system?
// books and lore
// sentient items
//lsot treasures
// ship building for costructing and upgrading vessels while sailing
// towns and cities need their own models with their own npcs shops and quests?
// currency and exchange rqates model 
// lost language, we create model, create quests where players encounter texts or NPCS who speak it, players then habe to colelct knowledge baout the language increasing proficiency and advaning
// vessel economy
// quests related to shipbuilding upgrading and protecting vessels, collapsing bridges rivers of fire, deeper in hell the ship challenges get harder
// update user to reflect karma system with a karma attribute
// fix your github trash because its downloaded as a zip file, i need to fork and clone so that i can push changes like a real fuckin one
// mail system for player to player
// demonic contracts offer powerful abilities that are not avialable through regular gameplay, provide advantage in combat and exploration, at a detriment through the player, they expire also
// demonic contracts may require sacrifice of moral alignment, or even the well being of NPCS
//political system for villages
// organize models routes and controllers into respective directories, economics, geograph6y, trade, demonology, artifacts or collectibles, religion and cults, politics, knowledge
// black  market trade system
// epic poems
// bard songs
// if we have races we could have cultural traditions
// deities for religions if we have a religion system
// hireable mercenaries
// deals and bargains with demons
// moral alignment affects interactions with NPCS
// time based restrictions and tiered levles and consequences for demonic contracts 
