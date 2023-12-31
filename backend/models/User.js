const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UserSchema = new mongoose.Schema(
    {
        username: {
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
        email: {
            type: String,
            required: [true, `Please provide a unique email address.`],
            unique: true,
            validate: {
                validator: validator.isEmail,
                message: 'Please provide a valid email address',
            },
            minlength: 5,
            maxlength: 254,
        },
        password: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            maxlength: 60,
        },
        role: {
            type: String,
            enum: ['user', 'playerMod', 'forumMod', 'admin', 'superAdmin'],
            default: 'user',
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
// If different route viewed, switch actionStatus to inactive
// Make modifed stats from armour and weapons virtual stats

UserSchema.virtual('combatLevel').get(function () {
    const { attackLvl, defenseLvl, strengthLvl, hitpointsLvl } = this;
    const averageLevel =
        (attackLvl + defenseLvl + strengthLvl + hitpointsLvl) / 4;
    return averageLevel;
});

UserSchema.virtual('modAttackLevel').get(function () {
    const { attackLvl, weaponPower } = this;
    let modAttack = weaponPower / 2 / 50;
    modAttack = attackLvl + modAttack;
    return modAttack;
});

UserSchema.virtual('modStrengthLevel').get(function () {
    const { strengthLvl, weaponPower } = this;
    let modStrength = weaponPower / 2 / 50;
    modStrength = strengthLvl + modStrength;
    return modStrength;
});

UserSchema.virtual('modDefenseLevel').get(function () {
    const { defenseLvl, armourRating } = this;
    let modDefense = armourRating / 50;
    modDefense = defenseLvl + modDefense;
    return modDefense;
});

// May need to be post instead of pre and an async function
UserSchema.pre('save', function (next) {
    // Calculate healthpool
    this.healthPool = this.hitpointsLvl * 10;

    next();
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
