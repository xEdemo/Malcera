const calculateCombatLevel = (attackLvl, defenseLvl, strengthLvl, hitpointsLvl) =>{
    const averageLevel =
        Math.floor((attackLvl + defenseLvl + strengthLvl + hitpointsLvl) / 4);
    return averageLevel;
};

export default calculateCombatLevel;