export function inventoryReducer(state, action) {
    switch (action.type) {
        case 'SET_INVENTORY_ITEMS':
            return {
                ...state,
                inventoryItems: action.payload,
                updatedInventoryItems: action.payload,
            };
        case 'SET_UPDATED_INVENTORY_ITEMS':
            return {
                ...state,
                updatedInventoryItems: action.payload,
            };
        default:
            return state;
    }
}

export const sidebarReducer = (state, action) => {
    switch (action.type) {
        case 'TOGGLE_INVENTORY':
            return {
                ...state,
                isInventoryOpen: !state.isInventoryOpen,
            };
        case 'TOGGLE_CHARACTER':
            return {
                ...state,
                isCharacterOpen: !state.isCharacterOpen,
            };
        default:
            return state;
    }
};
