import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCharacter } from '../../slices/character/characterSlice.js';
import { BoltIcon } from '@heroicons/react/24/outline';

const Character = ({ isCharacterOpen }) => {
    const [character, setCharacter] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fetchCharacterData = async () => {
        try {
            const res = await dispatch(getCharacter());
            setCharacter(res.payload.character);
        } catch (error) {
            console.error('Error fetching character.', error);
        }
    }

    const rerenderCharacter = () => {
        fetchCharacterData();
    }

    useEffect(() => {
        fetchCharacterData();
    }, []);

    const renderEquipmentSlot = (slotId) => {
        const item = character.equipment?.[slotId];
        if (!item) return null;

        // Replace the <img> src and alt attributes with the corresponding item data
        return (
            <img src={item?.image} alt={item?.name} />
        );
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
                        {renderEquipmentSlot('ammo')}
                        {/* Temp placeholder / example */}
                        {/* <BoltIcon style={{color: "rgba(255, 0, 0, 0.3)"}}/> */}
                    </div>
                </div>
                <div>
                    <div className="equipment-slot" id="mantle-slot">
                        {renderEquipmentSlot('mantle')}
                    </div>
                    <div className="equipment-slot" id="weapon-right-slot">
                        {renderEquipmentSlot('weaponRight')}
                    </div>
                    <div className="equipment-slot" id="hand-jewelry-right-slot">
                        {renderEquipmentSlot('handJewelryRight')}
                    </div>
                </div>
                <div>
                    <div className="equipment-slot" id="helmet-slot">
                        {renderEquipmentSlot('helmet')}
                    </div>
                    <div className="equipment-slot" id="neck-slot">
                        {renderEquipmentSlot('neck')}
                    </div>
                    <div className="equipment-slot" id="chest-slot">
                        {renderEquipmentSlot('chest')}
                    </div>
                    <div className="equipment-slot" id="greaves-slot">
                        {renderEquipmentSlot('greaves')}
                    </div>
                    <div className="equipment-slot" id="boots-slot">
                        {renderEquipmentSlot('boots')}
                    </div>
                </div>
                <div>
                    <div className="equipment-slot" id="gauntlets-slot">
                        {renderEquipmentSlot('gauntlets')}
                    </div>
                    <div className="equipment-slot" id="weapon-left-slot">
                        {renderEquipmentSlot('weaponLeft')}
                    </div>
                    <div className="equipment-slot" id="hand-jewelry-left-slot">
                        {renderEquipmentSlot('handJewelryLeft')}   
                    </div>
                </div>
            </div>
        </>
    )
}

export default Character;