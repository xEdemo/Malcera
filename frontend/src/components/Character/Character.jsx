import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCharacter } from "../../slices/character/characterSlice.js";
import {
    GiQuiver,
    GiSpikedShoulderArmor,
    GiShardSword,
    GiSkullRing,
    GiHeavyHelm,
    GiEmeraldNecklace,
    GiAbdominalArmor,
    GiLegArmor,
    GiArmoredPants,
    GiGauntlet,
} from "react-icons/gi";
import itemImages from "../../utils/itemImages.js";

const Character = ({ isCharacterOpen, character, rerenderCharacter }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        rerenderCharacter();
    }, []);

    const renderEquipmentSlot = (slotId) => {
        const item = character.equipment?.[slotId];

        if (!item) return null;

        if (slotId === "ammo") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiQuiver
                        className="character-default-img"
                        title="Ammo Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
        if (slotId === "mantle") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiSpikedShoulderArmor
                        className="character-default-img"
                        title="Mantle Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
        if (slotId === "weaponRight") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiShardSword
                        className="character-default-img"
                        style={{ transform: "scaleY(-1) scaleX(-1)" }}
                        title="Right Weapon Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
        if (slotId === "handJewelryRight") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiSkullRing
                        className="character-default-img"
                        title="Right Hand Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
        if (slotId === "helmet") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiHeavyHelm
                        className="character-default-img"
                        title="Helmet Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
        if (slotId === "neck") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiEmeraldNecklace
                        className="character-default-img"
                        title="Necklace Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
        if (slotId === "chest") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiAbdominalArmor
                        className="character-default-img"
                        title="Chest Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
        if (slotId === "greaves") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiArmoredPants
                        className="character-default-img"
                        title="Greave Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
        if (slotId === "boots") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiLegArmor
                        className="character-default-img"
                        title="Boot Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
        if (slotId === "gauntlets") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiGauntlet
                        className="character-default-img"
                        title="Gauntlet Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
        if (slotId === "weaponLeft") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiShardSword
                        className="character-default-img"
                        style={{ transform: "scaleY(-1)" }}
                        title="Left Weapon Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
        if (slotId === "handJewelryLeft") {
            if (item?.name === "Empty Slot") {
                return (
                    <GiSkullRing
                        className="character-default-img"
                        title="Left Hand Slot"
                    />
                );
            } else {
                return <img src={itemImages[item?.name]} alt={item?.name} title={item?.description} />;
            }
        }
    };

    const characterHeight = isCharacterOpen ? 340 : 0;

    return (
        <>
            <div
                className="character-container"
                style={{
                    height: characterHeight,
                }}
            >
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
