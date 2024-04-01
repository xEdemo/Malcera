const { Inventory, Character } = require("../models");

const replaceInventorySlot = async (itemId, emptySlot) => {
	const inventories = await Inventory.find({ "slots.item": itemId });

	let numberOfInventoriesUpdated = 0;

	await Promise.all(
		inventories.map(async (inventory) => {
			let updated = false;
			inventory.slots.forEach((slot) => {
				if (slot.item?.toString() === itemId) {
					// Replace the item with the "Empty Slot" item
					slot.item = emptySlot._id;
					slot.name = emptySlot.name;
					slot.description = emptySlot.description;
					slot.image = emptySlot.image;
					slot.stackable = emptySlot.stackable;
					slot.consumable = emptySlot.consumable;
					slot.equippable = emptySlot.equippable;
                    slot.equippableTo = emptySlot.equippableTo;
					slot.healAmount = undefined;
					slot.armourRating = undefined;
					slot.weaponPower = undefined;
					slot.quantity = undefined;
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
};

const replaceCharacterSlot = async (itemId, emptySlot) => {
	const characters = await Character.find({
		$or: [
			{ "equipment.helmet.item": itemId },
			{ "equipment.neck.item": itemId },
			{ "equipment.chest.item": itemId },
			{ "equipment.greaves.item": itemId },
			{ "equipment.boots.item": itemId },
			{ "equipment.gauntlets.item": itemId },
			{ "equipment.weaponRight.item": itemId },
			{ "equipment.weaponLeft.item": itemId },
			{ "equipment.handJewelryRight.item": itemId },
			{ "equipment.handJewelryLeft.item": itemId },
			{ "equipment.mantle.item": itemId },
			{ "equipment.ammo.item": itemId },
		],
	});

	let numberOfCharactersUpdated = 0;

	await Promise.all(
		characters.map(async (character) => {
			let updated = false;
			for (const slot in character.equipment) {
				if (character.equipment[slot]?.item?.toString() === itemId) {
					character.equipment[slot] = {
						item: emptySlot._id,
						name: emptySlot.name,
						description: emptySlot.description,
						image: emptySlot.image,
						stackable: emptySlot.stackable,
						consumable: emptySlot.consumable,
						equippable: emptySlot.equippable,
                        equippableTo: emptySlot.equippableTo,
						healAmount: undefined,
						armourRating: undefined,
						weaponPower: undefined,
						quantity: undefined,
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
	replaceInventorySlot,
	replaceCharacterSlot,
};
