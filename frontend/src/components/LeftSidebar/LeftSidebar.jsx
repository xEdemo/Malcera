import { useEffect, useRef, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useSelector, useDispatch } from 'react-redux';
import {
    sidebarReducer,
} from '../../reducers/LeftSiderbarReducer.js';
import { Inventory, Character } from '../';
import { getCharacter } from "../../slices/character/characterSlice.js";

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

    const [character, setCharacter] = useState({});

    const [scrollY, setScrollY] = useState(0);
    const leftSidebarRef = useRef(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.user);

    const handleToggleInventory = async () => {
        dispatchSidebar({ type: 'TOGGLE_INVENTORY' });
        //setContextMenuItemName('');
        //setCheckStackable(false);
    };

    const handleToggleCharacter = () => {
        dispatchSidebar({ type: 'TOGGLE_CHARACTER' });
    };

    useEffect(() => {
        saveSidebarStateToLocalStorage(sidebarState);
    }, [sidebarState]);

    const fetchCharacterData = async () => {
        try {
            const res = await dispatch(getCharacter());
            setCharacter(res.payload.character);
        } catch (error) {
            console.error("Error fetching character.", error);
        }
    };

    const rerenderCharacter = () => {
        fetchCharacterData();
    };

    useEffect(() => {
        fetchCharacterData();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            // Check if leftSidebarRef.current is truthy before accessing scrollTop
            if (leftSidebarRef.current) {
                setScrollY(leftSidebarRef.current.scrollTop)
            }
        };
    
        if (leftSidebarRef.current) {
            leftSidebarRef.current.addEventListener('scroll', handleScroll);
        }
    
        return () => {
            if (leftSidebarRef.current) {
                leftSidebarRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, [leftSidebarRef]);

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
                        scrollTop={scrollY}
                        rerenderCharacter={rerenderCharacter}
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
                    <Character 
                        isCharacterOpen={sidebarState.isCharacterOpen}
                        character={character}
                        rerenderCharacter={rerenderCharacter}
                    />
                )}
                <p>Other here</p>
            </div>
        </div>
    );
};

export default LeftSidebar;