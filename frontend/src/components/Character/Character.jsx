const Character = () => {
    const sidebarState = JSON.parse(localStorage.getItem('SIDEBAR_STATE'));
    // Height needs to be fixed
    const characterHeight = sidebarState.isCharacterOpen ? 400 : 0;

    return (
        <>
            <div
                className="character-container"
                style={{
                    height: characterHeight,
                }}
            >
                <div className="equipment-slot" id="helmet"></div>
                <div className="equipment-slot" id="shoulders"></div>
                <div className="equipment-slot" id="chest"></div>
                <div className="equipment-slot" id="weapon-left"></div>
                <div className="equipment-slot" id="weapon-right"></div>
                <div className="equipment-slot" id="ring-left"></div>
                <div className="equipment-slot" id="ring-right"></div>
                <div className="equipment-slot" id="greaves"></div>
                <div className="equipment-slot" id="boots"></div>
                <div className="equipment-slot" id="gloves"></div>
            </div>
        </>
    )
}

export default Character;