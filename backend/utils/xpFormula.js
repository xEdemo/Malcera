function calculateLevel(xp, xpThreshold, xpMultiplier, baseLevel) {
    const level = Math.max(
        baseLevel,
        Math.floor(Math.log(xp / xpThreshold) / Math.log(xpMultiplier))
    );
    return level;
}

module.exports = {
    calculateLevel,
};
