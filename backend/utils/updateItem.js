const { Inventory, Character } = require('../models');

const updateInventoryItem = async (
    itemId, 
    name,
    description,
    image,
    stackable,
    consumable,
    equippable,
    healAmount,
    armourRating,
    weaponPower,
) => {
    const inventories = await Inventory.find({ 'slots.item': itemId });

    let numberOfInventoriesUpdated = 0;

    await Promise.all(
        inventories.map(async (inventory) => {
            let updated = false;
            inventory.slots.forEach((slot) => {
                if (slot.item?.toString() === itemId) {
                    Object.assign(slot, {
                        name,
                        description,
                        image,
                        stackable,
                        consumable,
                        equippable,
                        healAmount,
                        armourRating,
                        weaponPower,
                    });
                    updated = true;
                }
            });
            if (updated) {
                await inventory.save();
                numberOfInventoriesUpdated++;
            }
        })
    );

    return numberOfInventoriesUpdated;
}

const updateCharacterItem = async (
    itemId, 
    name,
    description,
    image,
    stackable,
    consumable,
    equippable,
    healAmount,
    armourRating,
    weaponPower,
) => {
    const characters = await Character.find({ $or: [
        { 'equipment.helmet.item': itemId },
        { 'equipment.neck.item': itemId },
        { 'equipment.chest.item': itemId },
        { 'equipment.greaves.item': itemId },
        { 'equipment.boots.item': itemId },
        { 'equipment.gauntlets.item': itemId },
        { 'equipment.weaponRight.item': itemId },
        { 'equipment.weaponLeft.item': itemId },
        { 'equipment.handJewelryRight.item': itemId },
        { 'equipment.handJewelryLeft.item': itemId },
        { 'equipment.mantle.item': itemId },
        { 'equipment.ammo.item': itemId },
    ] });

    let numberOfCharactersUpdated = 0;

    await Promise.all(
        characters.map(async (character) => {
            let updated = false;
            for (const slot in character.equipment) {
                if (character.equipment[slot]?.item?.toString() === itemId) {
                    character.equipment[slot] = {
                        item: itemId,
                        name,
                        description,
                        image,
                        stackable,
                        consumable,
                        equippable,
                        healAmount,
                        armourRating,
                        weaponPower,
                    };
                    updated = true;
                }
            }
            if (updated) {
                await character.save();
                numberOfCharactersUpdated++;
            }
        })
    );

    return numberOfCharactersUpdated;
};

module.exports = {
    updateInventoryItem,
    updateCharacterItem,
}