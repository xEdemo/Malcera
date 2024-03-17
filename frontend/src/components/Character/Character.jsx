import { BoltIcon } from '@heroicons/react/24/outline';

const Character = ({ isCharacterOpen }) => {
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
                        {/* Temp placeholder / example */}
                        <BoltIcon style={{color: "rgba(255, 0, 0, 0.3)"}}/>
                    </div>
                </div>
                <div>
                    <div className="equipment-slot" id="mantle-slot"></div>
                    <div className="equipment-slot" id="weapon-right-slot"></div>
                    <div className="equipment-slot" id="hand-jewelry-right-slot"></div>
                </div>
                <div>
                    <div className="equipment-slot" id="helmet-slot"></div>
                    <div className="equipment-slot" id="neck-slot"></div>
                    <div className="equipment-slot" id="chest-slot"></div>
                    <div className="equipment-slot" id="greaves-slot"></div>
                    <div className="equipment-slot" id="boots-slot"></div>
                </div>
                <div>
                    <div className="equipment-slot" id="gauntlets-slot"></div>
                    <div className="equipment-slot" id="weapon-left-slot"></div>
                    <div className="equipment-slot" id="hand-jewelry-left-slot"></div>
                </div>
            </div>
        </>
    )
}

export default Character;