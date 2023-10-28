const { StatusCodes } = require('http-status-codes');
const { calculateLevel } = require('../utils');
const { User, Mob, Battle } = require('../models');

// @desc    Inspect mob
// route    Get /api/v1/battle/inspect/:mobId
// @access  Public
const inspectMob = async (req, res) => {
    const { mobId } = req.params;
    const mob = await Mob.findById(mobId).select('-__v');
    if (!mob) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No mob found with id ${mobId}`);
    }
    res.status(StatusCodes.OK).json({ mob });
};

// @desc    Create battle instance
// route    POST /api/v1/battle/:mobId
// @access  Public
const createBattleInstance = async (req, res) => {
    const { mobId } = req.params;
    const userId = req.user._id.toString();

    const mob = await Mob.findById(mobId);
    const user = await User.findById(userId);

    if (!mob) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No mob found with id ${mobId}`);
    }
    if (!user) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`No user found with id ${userId}`);
    }

    const existingBattle = await Battle.findOne({ user: userId });

    if (!existingBattle) {
        const battle = new Battle({
            user: userId,
            mob: mobId,
            name: mob.name,
            mobHealth: mob.healthPool,
            status: 'active',
        });

        battle.isAttackChecked = req.header('isAttackChecked');
        battle.isStrengthChecked = req.header('isStrengthChecked');
        battle.isDefenseChecked = req.header('isDefenseChecked');
        battle.isHitpointsChecked = req.header('isHitpointsChecked');

        await battle.save();
        const statusChange = 'attack';
        await User.findByIdAndUpdate(userId, { actionStatus: statusChange });
        res.status(StatusCodes.OK).json({ battle });
    } else if (existingBattle) {
        res.status(StatusCodes.OK).json({ battle: existingBattle });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        throw new Error(`An error occured generating a battle instance.`);
    }
};

// @desc    Get Instance
// route    Get /api/v1/battle/:battleId
// @access  Public
const getExistingBattle = async (req, res) => {
    const { battleId } = req.params;
    if (!battleId) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No battle instance found with id ${battleId}.`);
    }
    const battle = await Battle.findById(battleId);
    if (!battle) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No battle found. Try again later.`);
    }
    res.status(StatusCodes.OK).json({ battle });
};

// @desc    Attack mob
// route    Put /api/v1/battle/:battleId
// @access  Public
const performActionOnMob = async (req, res) => {
    const { battleId } = req.params;
    const userId = req.user._id.toString();

    const statusChange = 'inactive';

    const battle = await Battle.findById(battleId);
    if (!battle) {
        await User.findByIdAndUpdate(userId, { actionStatus: statusChange });
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No active battle with id ${battleId}.`);
    }
    if (battle.user.toString() !== userId) {
        await User.findByIdAndUpdate(userId, { actionStatus: statusChange });
        res.status(StatusCodes.FORBIDDEN);
        throw new Error(`You may not attack another user's mob.`);
    }
    const calculateXpMultiplier = () => {
        const numSelectedSkills = [
            battle.isAttackChecked,
            battle.isStrengthChecked,
            battle.isDefenseChecked,
            battle.isHitpointsChecked,
        ].filter((value) => value).length;
        switch (numSelectedSkills) {
            case 0:
                return 0;
            case 1:
                return 4;
            case 2:
                return 2;
            case 3:
                return 1.33;
            default:
                return 1;
        }
    };

    const mob = await Mob.findById(battle.mob);
    const user = await User.findById(userId);

    battle.name = battle.name.charAt(0).toUpperCase() + battle.name.slice(1);

    let userDamage;
    let mobDamage;

    if (user.actionStatus === 'attack' && battle.status === 'active') {
        const userHitChance = (user.modAttackLevel / mob.defenseLvl) * 100;
        console.log('User Hit Chance:', userHitChance);
        console.log('User modified att lvl:', user.modAttackLevel);
        const userRandomHitChance = Math.random() * 100 + 1;
        if (userHitChance >= userRandomHitChance) {
            userDamage = Math.round(Math.random() * user.modStrengthLevel);
            battle.mobHealth -= userDamage;
            await battle.save();
            if (battle.mobHealth <= 0) {
                const jossReward = Math.round(
                    Math.random() * mob.hitpointsLvl * 3
                );
                user.jossPaper += jossReward;

                const xpReward = (mob.hitpointsLvl * 3) / 4; // 4 skills
                const xpRewardMultiplier = calculateXpMultiplier();
                // console.log('xp multi:', xpRewardMultiplier);
                const attackXpReward = battle.isAttackChecked
                    ? Math.floor(xpReward * xpRewardMultiplier)
                    : 0;
                const defenseXpReward = battle.isDefenseChecked
                    ? Math.floor(xpReward * xpRewardMultiplier)
                    : 0;
                const strengthXpReward = battle.isStrengthChecked
                    ? Math.floor(xpReward * xpRewardMultiplier)
                    : 0;
                const hitpointsXpReward = battle.isHitpointsChecked
                    ? Math.floor(xpReward * xpRewardMultiplier)
                    : 0;
                // console.log('attack xp:', attackXpReward);
                // console.log('defense xp:', defenseXpReward);
                // console.log('strength xp:', strengthXpReward);
                // console.log('hitpoints xp:', hitpointsXpReward);

                user.attackXp += attackXpReward;
                user.defenseXp += defenseXpReward;
                user.strengthXp += strengthXpReward;
                user.hitpointsXp += hitpointsXpReward;

                user.mobKills += 1;

                const xpThreshold = 185;
                const xpMultiplier = 1.107633; // Exponential multiplier for leveling up; 1.119 for RuneScape

                user.attackLvl = calculateLevel(
                    user.attackXp,
                    xpThreshold,
                    xpMultiplier,
                    user.attackLvl
                );
                user.defenseLvl = calculateLevel(
                    user.defenseXp,
                    xpThreshold,
                    xpMultiplier,
                    user.defenseLvl
                );
                user.strengthLvl = calculateLevel(
                    user.strengthXp,
                    xpThreshold,
                    xpMultiplier,
                    user.strengthLvl
                );
                user.hitpointsLvl = calculateLevel(
                    user.hitpointsXp,
                    xpThreshold,
                    xpMultiplier,
                    user.hitpointsLvl
                );

                await User.findByIdAndUpdate(userId, {
                    jossPaper: user.jossPaper,
                    attackXp: user.attackXp,
                    defenseXp: user.defenseXp,
                    strengthXp: user.strengthXp,
                    hitpointsXp: user.hitpointsXp,
                    mobKills: user.mobKills,
                    attackLvl: user.attackLvl,
                    defenseLvl: user.defenseLvl,
                    strengthLvl: user.strengthLvl,
                    hitpointsLvl: user.hitpointsLvl,
                    actionStatus: statusChange,
                });

                const savedBattleInfo = await battle.save();
                await Battle.findByIdAndDelete(battleId);

                let message = `Congratulations, you won! You received `;
                const rewards = [];
                if (attackXpReward > 0) {
                    rewards.push(`${attackXpReward} attack xp`);
                }
                if (strengthXpReward > 0) {
                    rewards.push(`${strengthXpReward} strength xp`);
                }
                if (defenseXpReward > 0) {
                    rewards.push(`${defenseXpReward} defense xp`);
                }
                if (hitpointsXpReward > 0) {
                    rewards.push(`${hitpointsXpReward} hitpoints xp`);
                }
                const numberOfRewards = rewards.length;
                if (numberOfRewards === 0) {
                    message += `${jossReward} joss.`
                } else if (numberOfRewards === 1) {
                    message += `${rewards[0]} and ${jossReward} joss.`;
                } else {
                    const lastReward = rewards.pop();
                    message += `${rewards.join(', ')}, ${lastReward} and ${jossReward} joss.`;
                }

                return res.status(StatusCodes.OK).json({
                    message,
                    user,
                    battle: savedBattleInfo
                });
            }
        }
        const mobHitChance = (mob.attackLvl / user.modDefenseLevel) * 100;
        const mobRandomHitChance = Math.random() * 100 + 1;
        if (mobHitChance >= mobRandomHitChance) {
            mobDamage = Math.round(Math.random() * mob.strengthLvl);
            user.healthPool -= mobDamage;
            await User.findByIdAndUpdate(userId, {
                healthPool: user.healthPool,
            });
            if (user.healthPool <= 0) {
                if (user.jossPaper > 0) {
                    const deathCost = Math.round(user.jossPaper * 0.02);
                    user.jossPaper -= deathCost;
                }

                const healthAfter = user.healthPool;

                user.healthPool = user.hitpointsLvl * 10;
                await User.findByIdAndUpdate(userId, {
                    jossPaper: user.jossPaper,
                    healthPool: user.healthPool,
                    actionStatus: statusChange,
                });

                const savedBattleInfo = await battle.save();
                await Battle.findByIdAndDelete(battleId);

                const message = `Oh dear! ${battle.name} slew ${user.username}.`;

                return res.status(StatusCodes.OK).json({
                    message,
                    user,
                    battle: savedBattleInfo,
                    userDamage,
                    mobDamage,
                    healthAfter,
                });
            }
        }
        res.status(StatusCodes.OK).json({
            user,
            battle,
            userDamage,
            mobDamage,
        });
    } else {
        await User.findByIdAndUpdate(userId, { actionStatus: statusChange });
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error(`You're not in combat!`);
    }
};

// @desc    Flee from Mob
// route    DELETE /api/v1/battle/:battleId
// @access  Public
const fleeFromMob = async (req, res) => {
    const { battleId } = req.params;
    const userId = req.user._id.toString();

    const statusChange = 'inactive';

    const battle = await Battle.findById(battleId);
    if (!battle) {
        await User.findByIdAndUpdate(userId, { actionStatus: statusChange });
        res.status(StatusCodes.NOT_FOUND);
        throw new Error(`No active battle found with id ${battleId}.`);
    }
    if (battle.user.toString() !== userId) {
        await User.findByIdAndUpdate(userId, { actionStatus: statusChange });
        throw new ForbiddenError(`You may not flee from another user's mob.`);
    }

    const user = await User.findById(userId);
    if (user.jossPaper > 0) {
        const fleeCost = Math.round(user.jossPaper * 0.01); // User losses 1% of their joss on hand
        user.jossPaper -= fleeCost;
    }

    await User.findByIdAndUpdate(userId, {
        actionStatus: statusChange,
        jossPaper: user.jossPaper,
    });

    const savedBattleInfo = await battle.save();

    await Battle.findByIdAndDelete(battleId);

    res.status(StatusCodes.OK).json({ user, battle: savedBattleInfo });
};

module.exports = {
    inspectMob,
    createBattleInstance,
    getExistingBattle,
    performActionOnMob,
    fleeFromMob,
};
