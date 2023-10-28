const mongoose = require('mongoose');

const BattleSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        mob: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mob',
        },
        name: {
            type: String,
        },
        mobAttackLvl: {
            type: Number,
        },
        mobDefenseLvl: {
            type: Number,
        },
        mobStrengthLvl: {
            type: Number,
        },
        mobHealth: {
            type: Number,
        },
        status: {
            type: String,
            default: 'inactive',
        },
        isAttackChecked: {
            type: Boolean,
            default: false,
        },
        isStrengthChecked: {
            type: Boolean,
            default: false,
        },
        isDefenseChecked: {
            type: Boolean,
            default: false,
        },
        isHitpointsChecked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

BattleSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const Battle = mongoose.model('Battle', BattleSchema);

module.exports = Battle;
