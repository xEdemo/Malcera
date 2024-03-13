import { useEffect, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useSelector, useDispatch } from 'react-redux';
import { getInventory } from '../../slices/inventory/inventorySlice.js';
import {
    inventoryReducer,
    sidebarReducer,
} from '../../reducers/LeftSiderbarReducer.js';
import { Inventory, Character } from '../';

// Function to save sidebar state to local storage
const saveSidebarStateToLocalStorage = (state) => {
    localStorage.setItem('SIDEBAR_STATE', JSON.stringify(state));
};

// Function to load sidebar state from local storage
const loadSidebarStateFromLocalStorage = () => {
    const storedState = localStorage.getItem('SIDEBAR_STATE');
    return storedState ? JSON.parse(storedState) : { isInventoryOpen: false, isCharacterOpen: false };
};

const LeftSidebar = () => {
    const [sidebarState, dispatchSidebar] = useReducer(sidebarReducer, loadSidebarStateFromLocalStorage());

    const [inventoryState, dispatchInventory] = useReducer(inventoryReducer, {
        inventoryItems: [],
        updatedInventoryItems: [],
    });

    const leftSidebarRef = useRef(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.user);

    const fetchInventoryData = async () => {
        try {
            const res = await dispatch(getInventory());
            if (
                res.payload &&
                res.payload.updatedInventory &&
                res.payload.updatedInventory.slots
            ) {
                dispatchInventory({
                    type: 'SET_INVENTORY_ITEMS',
                    payload: res.payload.updatedInventory.slots,
                });
            }
        } catch (error) {
            console.error('Error fetching inventory', error);
        }
    };

    const handleToggleInventory = async () => {
        dispatchSidebar({ type: 'TOGGLE_INVENTORY' });
        //setContextMenuItemName('');
        //setCheckStackable(false);

        if (!sidebarState.isInventoryOpen) {
            await fetchInventoryData();
        }
    };

    const handleToggleCharacter = () => {
        dispatchSidebar({ type: 'TOGGLE_CHARACTER' });
    };

    useEffect(() => {
        saveSidebarStateToLocalStorage(sidebarState);
    }, [sidebarState]);

    return (
        <div 
            className="left-sidebar" 
            ref={leftSidebarRef}
        >
            <div className="left-sidebar-content-container">
                <p onClick={handleToggleInventory}>
                    Inventory{' '}
                    {sidebarState.isInventoryOpen ? (
                        <ChevronUpIcon className="chevron-down-sidebar" />
                    ) : (
                        <ChevronDownIcon className="chevron-up-sidebar" />
                    )}{' '}
                </p>
                {sidebarState.isInventoryOpen && (
                    <Inventory
                        scrollTop={leftSidebarRef.current?.scrollTop}
                    />
                )}
                <p onClick={handleToggleCharacter}>
                    Character{' '}
                    {sidebarState.isCharacterOpen ? (
                        <ChevronUpIcon className="chevron-down-sidebar" />
                    ) : (
                        <ChevronDownIcon className="chevron-up-sidebar" />
                    )}{' '}
                </p>
                {sidebarState.isCharacterOpen && (
                    <Character />
                )}
                <p>Other here</p>
            </div>
        </div>
    );
};

export default LeftSidebar;