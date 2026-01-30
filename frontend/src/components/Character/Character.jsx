import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	GiQuiver,
	GiSpikedShoulderArmor,
	GiShardSword,
	GiSkullRing,
	GiHeavyHelm,
	GiEmeraldNecklace,
	GiAbdominalArmor,
	GiLegArmor,
	GiGreaves,
	GiGauntlet,
} from "react-icons/gi";
import itemImages from "../../utils/itemImages.js";
import { useUnequipOnClickMutation } from "../../slices/character/characterApiSlice.js";
import { toast } from "react-toastify";

const ItemSlot = ({ item, itemQty, handleUnequipOnClick, slotId }) => {
	return (
		<>
			<img
				src={item?.image.url || itemImages[item?.name]}
				alt={item?.name}
				title={item?.description}
				className="character-item-img"
				onClick={() => handleUnequipOnClick(slotId)}
			/>
			{item?.flags?.stackable && (
				<b className="inventory-quantity" style={{ top: "18px" }}>
					{itemQty}
				</b>
			)}
		</>
	);
};

const Character = ({ character, rerenderCharacter, rerenderInventory }) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [unequipItem] = useUnequipOnClickMutation();

	useEffect(() => {
		rerenderCharacter();
	}, []);

	const handleUnequipOnClick = async (slotId) => {
		try {
			const res = await unequipItem({
				slot: slotId,
			});
			if (res.data) {
				rerenderCharacter();
				rerenderInventory();
			}
			if (res.error && res.error.data && res.error.data.message) {
				toast.error(res.error.data.message);
			}
		} catch (error) {
			toast.error("Error unequipping an item.");
		}
	};

	const renderEquipmentSlot = (slotId) => {
		const item = character?.equipment?.[slotId]?.item;
		const itemQty = character?.equipment?.[slotId]?.quantity;
		const isEmptySlot = item === null;

		let slotComponent;

		switch (slotId) {
			case "ammo":
				slotComponent = isEmptySlot ? (
					<GiQuiver
						className="character-default-img"
						title="Ammo Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			case "mantle":
				slotComponent = isEmptySlot ? (
					<GiSpikedShoulderArmor
						className="character-default-img"
						title="Mantle Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			case "weaponRight":
				slotComponent = isEmptySlot ? (
					<GiShardSword
						className="character-default-img"
						style={{ transform: "scaleY(-1) scaleX(-1)" }}
						title="Right Weapon Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			case "handJewelryRight":
				slotComponent = isEmptySlot ? (
					<GiSkullRing
						className="character-default-img"
						title="Right Hand Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			case "helmet":
				slotComponent = isEmptySlot ? (
					<GiHeavyHelm
						className="character-default-img"
						title="Helmet Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			case "neck":
				slotComponent = isEmptySlot ? (
					<GiEmeraldNecklace
						className="character-default-img"
						title="Necklace Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			case "chest":
				slotComponent = isEmptySlot ? (
					<GiAbdominalArmor
						className="character-default-img"
						title="Chest Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			case "greaves":
				slotComponent = isEmptySlot ? (
					<GiGreaves
						className="character-default-img"
						title="Greave Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			case "boots":
				slotComponent = isEmptySlot ? (
					<GiLegArmor
						className="character-default-img"
						title="Boot Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			case "gauntlets":
				slotComponent = isEmptySlot ? (
					<GiGauntlet
						className="character-default-img"
						title="Gauntlet Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			case "weaponLeft":
				slotComponent = isEmptySlot ? (
					<GiShardSword
						className="character-default-img"
						style={{ transform: "scaleY(-1)" }}
						title="Left Weapon Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			case "handJewelryLeft":
				slotComponent = isEmptySlot ? (
					<GiSkullRing
						className="character-default-img"
						title="Left Hand Slot"
					/>
				) : (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
			default:
				slotComponent = (
					<ItemSlot
						item={item}
						itemQty={itemQty}
						handleUnequipOnClick={handleUnequipOnClick}
						slotId={slotId}
					/>
				);
				break;
		}

		return slotComponent;
	};

	return (
		<>
			<div className="character-container">
				<b>Stats</b>
				<div className="ammo-container">
					<div className="equipment-slot" id="ammo-slot">
						{renderEquipmentSlot("ammo")}
					</div>
				</div>
				<div>
					<div className="equipment-slot" id="mantle-slot">
						{renderEquipmentSlot("mantle")}
					</div>
					<div className="equipment-slot" id="weapon-right-slot">
						{renderEquipmentSlot("weaponRight")}
					</div>
					<div
						className="equipment-slot"
						id="hand-jewelry-right-slot"
					>
						{renderEquipmentSlot("handJewelryRight")}
					</div>
				</div>
				<div>
					<div className="equipment-slot" id="helmet-slot">
						{renderEquipmentSlot("helmet")}
					</div>
					<div className="equipment-slot" id="neck-slot">
						{renderEquipmentSlot("neck")}
					</div>
					<div className="equipment-slot" id="chest-slot">
						{renderEquipmentSlot("chest")}
					</div>
					<div className="equipment-slot" id="greaves-slot">
						{renderEquipmentSlot("greaves")}
					</div>
					<div className="equipment-slot" id="boots-slot">
						{renderEquipmentSlot("boots")}
					</div>
				</div>
				<div>
					<div className="equipment-slot" id="gauntlets-slot">
						{renderEquipmentSlot("gauntlets")}
					</div>
					<div className="equipment-slot" id="weapon-left-slot">
						{renderEquipmentSlot("weaponLeft")}
					</div>
					<div className="equipment-slot" id="hand-jewelry-left-slot">
						{renderEquipmentSlot("handJewelryLeft")}
					</div>
				</div>
			</div>
		</>
	);
};

export default Character;
