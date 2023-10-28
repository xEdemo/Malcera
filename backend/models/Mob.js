const mongoose = require('mongoose');

const MobSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        attackLvl: {
            type: Number,
            required: true,
        },
        defenseLvl: {
            type: Number,
            required: true,
        },
        strengthLvl: {
            type: Number,
            required: true,
        },
        hitpointsLvl: {
            type: Number,
            required: true,
        },
        healthPool: {
            type: Number,
            default: 10,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

MobSchema.virtual('combatLevel').get(function () {
    const { attackLvl, defenseLvl, strengthLvl, hitpointsLvl } = this;
    const averageLevel = Math.floor((attackLvl + defenseLvl + strengthLvl + hitpointsLvl) / 4);
    return averageLevel;
});

MobSchema.pre('save', function (next) {
    this.healthPool = this.hitpointsLvl * 10;
    next();
});

const Mob = mongoose.model('Mob', MobSchema);

module.exports = Mob;