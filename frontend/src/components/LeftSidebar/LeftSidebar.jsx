import React from 'react';
import { useState, useEffect, useRef, useReducer, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useSelector, useDispatch } from 'react-redux';
import {
    useUpdateInventoryOnDropMutation,
    useGetInventoryQuery,
    useCombineStackMutation,
} from '../../slices/inventory/inventoryApiSlice.js';
import {
    updateInventoryOnChange,
    getInventory,
} from '../../slices/inventory/inventorySlice.js';
import debounce from 'lodash.debounce';
import { ContextMenu, useContextMenu } from '../../components';
import {
    inventoryReducer,
    sidebarReducer,
} from '../../reducers/LeftSiderbarReducer.js';

const inventoryRows = 8;
const inventoryColumns = 5;
const inventorySlots = inventoryRows * inventoryColumns;

const LeftSidebar = () => {
    const [sidebarState, dispatchSidebar] = useReducer(sidebarReducer, {
        isInventoryOpen: false,
        isCharacterOpen: false,
    });

    const [inventoryState, dispatchInventory] = useReducer(inventoryReducer, {
        inventoryItems: [],
        updatedInventoryItems: [],
    });
    const inventoryItems = inventoryState.inventoryItems;
    const updatedInventoryItems = inventoryState.updatedInventoryItems;

    const [draggedItem, setDraggedItem] = useState(null);
    const draggedItemRef = useRef(null);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [initialDragIndex, setInitialDragIndex] = useState(null);

    const [onDrop, { onDropError }] = useUpdateInventoryOnDropMutation();
    const { data: inventoryData, error } = useGetInventoryQuery();

    const { contextMenu, showContextMenu } = useContextMenu();
    const [contextMenuItemName, setContextMenuItemName] = useState('');
    const [checkStackable, setCheckStackable] = useState(false);
    const [checkQuantity, setCheckQuantity] = useState(0);
    const [checkIndex, setCheckIndex] = useState(null);

    const [combineStack] = useCombineStackMutation();

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

    const rerenderInventory = () => {
        fetchInventoryData(); 
    };

    const handleToggleInventory = async () => {
        dispatchSidebar({ type: 'TOGGLE_INVENTORY' });
        setContextMenuItemName('');
        setCheckStackable(false);

        if (!sidebarState.isInventoryOpen) {
            await fetchInventoryData();
        }
    };

    const handleToggleCharacter = () => {
        dispatchSidebar({ type: 'TOGGLE_CHARACTER' });
    };

    const inventoryContainerRef = useRef(null);

    const handleDragStart = (index, e) => {
        e.stopPropagation();
        if (e.button !== 0) return;

        const itemToDrag = inventoryItems[index];

        if (itemToDrag.name === 'Empty Slot') {
            console.error('Invalid item to drag:', itemToDrag);
            return;
        }

        setDraggedItem(itemToDrag);
        setInitialDragIndex(index);

        const inventoryRect =
            inventoryContainerRef.current.getBoundingClientRect();

        const offsetX = e.clientX - inventoryRect.left;
        const offsetY = e.clientY - inventoryRect.top;

        setOffsetX(offsetX);
        setOffsetY(offsetY);
        draggedItemRef.current = index;
    };

    const handleDrag = (e) => {
        if (!draggedItem) return;
        e.preventDefault();

        const inventoryRect =
            inventoryContainerRef.current.getBoundingClientRect();

        setDraggedItem((prevItem) => ({
            ...prevItem,
            positionX: Math.round(e.clientX - offsetX - inventoryRect.left),
            positionY: Math.round(e.clientY - offsetY - inventoryRect.top),
        }));

        e.target.style.cursor = 'grabbing';
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

        if (
            isNaN(clampedRow) ||
            isNaN(clampedColumn) ||
            draggedItemRef.current === newIndex
        ) {
            return;
        }

        try {
            const updatedItems = [...updatedInventoryItems];
            const tempItem = updatedItems[draggedItemRef.current];

            updatedItems[draggedItemRef.current] = updatedItems[newIndex];
            updatedItems[newIndex] = tempItem;

            // Makes inventory seem less reboundy
            // dispatchInventory({
            //     type: 'SET_UPDATED_INVENTORY_ITEMS',
            //     payload: updatedItems,
            // });

            // console.log(
            //     draggedItem.name,
            //     updatedItems[draggedItemRef.current].name,
            //     draggedItem.stackable,
            //     updatedItems[draggedItemRef.current].stackable,
            // );

            if (
                draggedItem.name !==
                    updatedItems[draggedItemRef.current].name &&
                !(
                    draggedItem.stackable &&
                    updatedItems[draggedItemRef.current].stackable
                )
            ) {
                const res = await onDrop({
                    changedIndices: [draggedItemRef.current, newIndex],
                    updatedItems,
                }).unwrap();

                if (res.updatedInventory && res.updatedInventory.slots) {
                    dispatchInventory({
                        type: 'SET_INVENTORY_ITEMS',
                        payload: res.updatedInventory.slots,
                    });
                    console.log('API Response:', res);
                } else {
                    console.error(
                        'Invalid response format from server on drop:',
                        res
                    );
                }
            } else if (
                draggedItem.stackable &&
                updatedItems[draggedItemRef.current].stackable
            ) {
                const res = await combineStack({
                    emptySlotIndex: draggedItemRef.current,
                    combinedIndex: newIndex,
                }).unwrap();

                if (res.updatedInventory && res.updatedInventory.slots) {
                    dispatchInventory({
                        type: 'SET_INVENTORY_ITEMS',
                        payload: res.updatedInventory.slots,
                    });
                    console.log('API Response for combine:', res);
                } else {
                    console.error(
                        'Invalid response format from server on combine:',
                        res
                    );
                }
            }
        } catch (err) {
            console.error('Error updating inventory', err);
        }

        e.target.style.cursor = 'grab';

        setCheckIndex(newIndex);

        setDraggedItem(null);
        draggedItemRef.current = null;
    };

    const handleTouchStart = (index, e) => {
        if (e) {
            e.stopPropagation();

            setDraggedItem(inventoryItems[index]);
            setInitialDragIndex(index);

            const inventoryRect =
                inventoryContainerRef.current.getBoundingClientRect();

            const offsetX = e.touches[0].clientX - inventoryRect.left;
            const offsetY = e.touches[0].clientY - inventoryRect.top;

            setOffsetX(offsetX);
            setOffsetY(offsetY);
            draggedItemRef.current = index;

            inventoryContainerRef.current.addEventListener(
                'touchmove',
                preventScroll,
                {
                    passive: false,
                }
            );
        }
    };

    const preventScroll = (e) => {
        e.preventDefault();
    };

    const handleTouchMove = (e) => {
        if (!draggedItem) return;
        //e.preventDefault();

        const inventoryRect =
            inventoryContainerRef.current.getBoundingClientRect();

        setDraggedItem((prevItem) => ({
            ...prevItem,
            positionX: Math.round(e.clientX - offsetX - inventoryRect.left),
            positionY: Math.round(e.clientY - offsetY - inventoryRect.top),
        }));
    };

    const handleMouseUp = () => {
        setDraggedItem(null);
        setInitialDragIndex(null);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // useEffect(() => {
    //     if (
    //         inventoryData &&
    //         inventoryData.updatedInventory &&
    //         inventoryData.updatedInventory.slots
    //     ) {
    //         dispatchInventory({
    //             type: 'SET_INVENTORY_ITEMS',
    //             payload: inventoryData.updatedInventory.slots,
    //         });
    //     } else if (error) {
    //         console.error('Error fetching inventory:', error);
    //     }
    // }, [sidebarState.isInventoryOpen, inventoryData, error]);

    useEffect(() => {
        if (!contextMenu.show) {
            setContextMenuItemName('');
            setCheckStackable(false);
        }
    }, [contextMenu.show]);

    useEffect(() => {
        if (contextMenu.index !== undefined) {
            const itemName = inventoryItems[contextMenu.index]?.name;
            const isStackable = inventoryItems[contextMenu.index]?.stackable;
            const stackQuantity = inventoryItems[contextMenu.index]?.quantity;
            const itemIndex = contextMenu.index;

            const checkForEmptySlot = inventoryItems.some(
                (item) => item.name === 'Empty Slot'
            );

            if (itemName !== contextMenuItemName) {
                setContextMenuItemName(itemName);
            }
            if (isStackable && checkForEmptySlot) {
                setCheckStackable(isStackable);
            } else {
                setCheckStackable(false);
            }
            if (stackQuantity) {
                setCheckQuantity(stackQuantity);
            }
            if (itemIndex !== null) {
                setCheckIndex(itemIndex);
            }
        }
    }, [contextMenu]);

    const inventoryHeight = sidebarState.isInventoryOpen ? 424 : 0;
    const characterHeight = sidebarState.isCharacterOpen ? 400 : 0;

    const handleDragStartDebounced = debounce(handleDragStart, 0);
    const handleDragEndDebounced = debounce(handleDragEnd, 0);

    return (
        <div className="left-sidebar">
            <ContextMenu
                contextMenu={contextMenu}
                itemName={contextMenuItemName}
                splitStackableItem={checkStackable}
                checkOriginalQuantity={checkQuantity}
                index={checkIndex}
                rerenderInventory={rerenderInventory}
            />
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
                    <div
                        className={`inventory-container ${
                            sidebarState.isInventoryOpen ? 'open' : ''
                        }`}
                        style={{
                            height: inventoryHeight,
                        }}
                        onMouseMove={handleDrag}
                        onMouseUp={handleDragEndDebounced}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleDragEndDebounced}
                        ref={inventoryContainerRef}
                    >
                        {updatedInventoryItems.map((inventoryItem, index) => (
                            <React.Fragment key={index}>
                                <div className={`inventory-slot`}>
                                    {inventoryItem?.name !== 'Empty Slot' && (
                                        <>
                                            <img
                                                src={inventoryItem?.image}
                                                alt={inventoryItem?.name}
                                                style={{
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
                                                draggable
                                                onMouseDown={(e) =>
                                                    handleDragStartDebounced(
                                                        index,
                                                        e
                                                    )
                                                }
                                                onTouchStart={(e) =>
                                                    handleTouchStart(index, e)
                                                }
                                                onContextMenu={(e) =>
                                                    showContextMenu(index, e)
                                                }
                                            />
                                            {inventoryItem?.stackable && (
                                                <>{inventoryItem?.quantity}</>
                                            )}
                                        </>
                                    )}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
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
