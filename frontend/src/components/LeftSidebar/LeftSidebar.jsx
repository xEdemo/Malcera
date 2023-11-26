import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useSelector, useDispatch } from 'react-redux';
import {
    useUpdateInventoryOnDropMutation,
    useGetInventoryQuery,
} from '../../slices/inventory/inventoryApiSlice.js';
import {
    updateInventoryOnChange,
    getInventory,
} from '../../slices/inventory/inventorySlice.js';

const inventoryRows = 8;
const inventoryColumns = 5;
const inventorySlots = 40;

const LeftSidebar = () => {
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [inventoryHeight, setInventoryHeight] = useState(0);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const draggedItemRef = useRef(null);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [updatedInventoryItems, setUpdatedInventoryItems] = useState([]);
    const [initialDragIndex, setInitialDragIndex] = useState(null);

    const [isCharacterOpen, setIsCharacterOpen] = useState(false);
    const [characterHeight, setCharacterHeight] = useState(0);

    const [onDrop, { onDropError }] = useUpdateInventoryOnDropMutation();
    const { data: inventoryData, error } = useGetInventoryQuery();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.user);

    const fetchInventoryData = async () => {
        try {
            const response = await dispatch(getInventory());
            if (
                response.payload &&
                response.payload.updatedInventory &&
                response.payload.updatedInventory.slots
            ) {
                setInventoryItems(response.payload.updatedInventory.slots);
                setUpdatedInventoryItems(
                    response.payload.updatedInventory.slots
                );
            }
        } catch (error) {
            console.error('Error fetching inventory', error);
        }
    };

    const handleToggleInventory = async () => {
        setIsInventoryOpen(!isInventoryOpen);

        if (!isInventoryOpen) {
            fetchInventoryData();
        }
    };

    const handleToggleCharacter = () => {
        setIsCharacterOpen(!isCharacterOpen);
    };

    const handleDragStart = (index, e) => {
        e.stopPropagation(); // Prevent other click events from triggering

        //newIndexRef.current = null;

        // keeps item from deleting
        //setUpdatedInventoryItems(userInfo.inventory.slots || []);

        setDraggedItem(inventoryItems[index]);
        setInitialDragIndex(index);

        const inventoryContainer = document.querySelector(
            '.inventory-container'
        );
        const inventoryRect = inventoryContainer.getBoundingClientRect();

        // Calculate the offset relative to the inventory container's top-left corner
        const offsetX = e.clientX - inventoryRect.left;
        const offsetY = e.clientY - inventoryRect.top;

        setOffsetX(offsetX);
        setOffsetY(offsetY);
        draggedItemRef.current = index;

        e.target.style.cursor = 'grabbing';
    };

    const handleDrag = (e) => {
        if (!draggedItem) return;
        e.preventDefault();

        const inventoryContainer = document.querySelector(
            '.inventory-container'
        );
        const inventoryRect = inventoryContainer.getBoundingClientRect();

        setDraggedItem((prevItem) => ({
            ...prevItem,
            positionX: e.clientX - offsetX - inventoryRect.left,
            positionY: e.clientY - offsetY - inventoryRect.top,
        }));
    };

    const handleDragEnd = async (e) => {
        if (!draggedItem || initialDragIndex === null) return;

        const mouseX = draggedItem.positionX + 24;
        const mouseY = draggedItem.positionY + 24;

        const row = Math.floor(mouseY / 48);
        const column = Math.floor(mouseX / 48);

        const clampedRow = Math.min(row, inventoryRows - 1);
        const clampedColumn = Math.min(column, inventoryColumns - 1);

        let newIndex = clampedRow * inventoryColumns + clampedColumn;
        newIndex += draggedItemRef.current;
        newIndex = Math.max(0, newIndex);
        newIndex = Math.min(inventorySlots - 1, newIndex);

        if (isNaN(clampedRow) || isNaN(clampedColumn)) {
            return;
        }

        try {
            const updatedItems = [...updatedInventoryItems];
            const tempItem = updatedItems[draggedItemRef.current];

            updatedItems[draggedItemRef.current] = updatedItems[newIndex];
            updatedItems[newIndex] = tempItem;

            // Immediately update the state with the correct positions
            setUpdatedInventoryItems(updatedItems);

            // Update the database only after the state has been updated
            const res = await onDrop({
                changedIndices: [draggedItemRef.current, newIndex],
                updatedItems,
            }).unwrap();

            // Ensure the response is valid
            if (res.updatedInventory && res.updatedInventory.slots) {
                dispatch(updateInventoryOnChange(res.updatedInventory.slots));
                console.log('API Response:', res);
            } else {
                console.error('Invalid response format from server:', res);
            }
        } catch (err) {
            console.error('Error updating inventory', err);
        }

        e.target.style.cursor = 'grab';

        setDraggedItem(null);
        draggedItemRef.current = null;
    };

    const handleTouchStart = (index, e) => {
        if (e) {
            e.stopPropagation();
            setDraggedItem(inventoryItems[index]);
            setInitialDragIndex(index);

            const inventoryContainer = document.querySelector(
                '.inventory-container'
            );
            const inventoryRect = inventoryContainer.getBoundingClientRect();

            const offsetX = e.touches[0].clientX - inventoryRect.left;
            const offsetY = e.touches[0].clientY - inventoryRect.top;

            setOffsetX(offsetX);
            setOffsetY(offsetY);
            draggedItemRef.current = index;

            e.target.style.cursor = 'grabbing';

            inventoryContainer.addEventListener('touchmove', preventScroll, {
                passive: false,
            });
        }
    };

    const preventScroll = (e) => {
        e.preventDefault();
    };

    const handleTouchMove = (e) => {
        if (!draggedItem) return;
        //e.preventDefault();

        const inventoryContainer = document.querySelector(
            '.inventory-container'
        );
        const inventoryRect = inventoryContainer.getBoundingClientRect();

        setDraggedItem((prevItem) => ({
            ...prevItem,
            positionX: e.touches[0].clientX - offsetX - inventoryRect.left,
            positionY: e.touches[0].clientY - offsetY - inventoryRect.top,
        }));
    };

    useEffect(() => {
        setInventoryHeight(isInventoryOpen ? 424 : 0);
        //setUpdatedInventoryItems(
        //Array.from({ length: inventorySlots }).fill(null)
        //);

        //const userInventory = userInfo.inventory.slots || [];

        if (
            inventoryData &&
            inventoryData.updatedInventory &&
            inventoryData.updatedInventory.slots
        ) {
            // Update local state with the current inventory items
            setInventoryItems(inventoryData.updatedInventory.slots);
            setUpdatedInventoryItems(inventoryData.updatedInventory.slots);
        } else if (error) {
            console.error('Error fetching inventory', error);
        }
    }, [isInventoryOpen, inventoryData, error]);

    useEffect(() => {
        setCharacterHeight(isCharacterOpen ? 400 : 0);
    }, [isCharacterOpen]);

    return (
        <div className="left-sidebar">
            <div className="left-sidebar-content-container">
                <p onClick={handleToggleInventory}>
                    Inventory{' '}
                    {isInventoryOpen ? (
                        <ChevronUpIcon className="chevron-down-sidebar" />
                    ) : (
                        <ChevronDownIcon className="chevron-up-sidebar" />
                    )}{' '}
                </p>
                {isInventoryOpen && (
                    <div
                        className="inventory-container"
                        style={{
                            height: inventoryHeight,
                        }}
                        onMouseMove={handleDrag}
                        onMouseUp={handleDragEnd}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleDragEnd}
                    >
                        {/* Generate slots */}
                        {updatedInventoryItems.map((inventoryItem, index) => (
                            <div
                                key={index}
                                style={{
                                    border: '1px solid var(--theme-grey-o-400)',
                                    width: '48px',
                                    height: '48px',
                                }}
                            >
                                {inventoryItem?.name !== 'Empty Slot' && (
                                    <>
                                        <img
                                            src={inventoryItem?.image}
                                            alt={inventoryItem?.name}
                                            style={{
                                                cursor: 'grab',
                                                zIndex:
                                                    draggedItem &&
                                                    draggedItemRef.current ===
                                                        index
                                                        ? 1
                                                        : 'auto',
                                                transform:
                                                    draggedItem &&
                                                    draggedItemRef.current ===
                                                        index
                                                        ? `translate(${draggedItem.positionX}px, ${draggedItem.positionY}px)`
                                                        : 'none',
                                            }}
                                            onMouseDown={(e) =>
                                                handleDragStart(index, e)
                                            }
                                            onTouchStart={(e) =>
                                                handleTouchStart(index, e)
                                            }
                                        />
                                        {inventoryItem?.quantity}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <p onClick={handleToggleCharacter}>
                    Character{' '}
                    {isCharacterOpen ? (
                        <ChevronUpIcon className="chevron-down-sidebar" />
                    ) : (
                        <ChevronDownIcon className="chevron-up-sidebar" />
                    )}{' '}
                </p>
                {isCharacterOpen && (
                    <div
                        className="character-container"
                        style={{
                            height: characterHeight,
                        }}
                    ></div>
                )}
                <p>Other here</p>
            </div>
        </div>
    );
};
export default LeftSidebar;
