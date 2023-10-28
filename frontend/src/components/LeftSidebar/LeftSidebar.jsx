import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useSelector, useDispatch } from 'react-redux';
import cloneDeep from 'lodash.clonedeep';

const inventoryRows = 8;
const inventoryColumns = 5;
const inventorySlots = 40;

const LeftSidebar = () => {
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [inventoryHeight, setInventoryHeight] = useState(0);
    const [inventoryItems, setInventoryItems] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const draggedItemRef = useRef(null);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [updatedInventoryItems, setUpdatedInventoryItems] = useState([]);
    const [initialDragIndex, setInitialDragIndex] = useState(null);

    const [isCharacterOpen, setIsCharacterOpen] = useState(false);
    const [characterHeight, setCharacterHeight] = useState(0);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.user);

    const handleToggleCharacter = () => {
        setIsCharacterOpen(!isCharacterOpen);
    }

    const handleToggleInventory = () => {
        setIsInventoryOpen(!isInventoryOpen);
    };

    const handleDragStart = (index, e) => {
        e.stopPropagation(); // Prevent other click events from triggering
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

    const handleDragEnd = (e) => {
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
        } else if (newIndex !== draggedItemRef.current) {
            setUpdatedInventoryItems((prevItems) => {
                const updatedItems = prevItems.map((item) => cloneDeep(item));

                console.log('newIndex:', newIndex);

                if (updatedItems[initialDragIndex] !== undefined) {
                    // Dragged item is not vacant, so perform swapping
                    const tempItem = updatedItems[initialDragIndex];
                    updatedItems[initialDragIndex] = updatedItems[newIndex];
                    updatedItems[newIndex] = tempItem;
                } else {
                    // Dragged item is vacant, so move it to the vacant slot
                    updatedItems[newIndex] = draggedItem;
                    // Clear the source slot (dragged item)
                    updatedItems[initialDragIndex] = null;
                }
                return updatedItems;
            });
        }

        e.target.style.cursor = 'grab';

        setDraggedItem(null);
        draggedItemRef.current = null;
    };

    const handleTouchStart = (index, e) => {
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
    };

    const handleTouchMove = (e) => {
        if (!draggedItem) return;
        e.preventDefault();

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
        const pseudoItemsArray = Array.from({ length: inventorySlots }).fill({
            isPseudoItem: true,
        });
        userInfo.inventory.slots.forEach((item, index) => {
            pseudoItemsArray[index] = item;
        });
        setInventoryItems(pseudoItemsArray);
        setUpdatedInventoryItems(pseudoItemsArray);
    }, [isInventoryOpen, userInfo.inventory.slots]);

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
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleDragEnd}
                    >
                        {/* Generate slots */}
                        {Array.from({ length: inventorySlots }).map(
                            (_, index) => {
                                const inventoryItem =
                                    updatedInventoryItems[index];
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            border: '1px solid var(--theme-grey-o-400)',
                                            width: '48px',
                                            height: '48px',
                                        }}
                                    >
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
                                            onMouseDown={(e) => {
                                                //e.preventDefault();
                                                handleDragStart(index, e);
                                            }}
                                            onTouchStart={(e) => {
                                                handleTouchStart(index, e);
                                            }}
                                        />
                                        {inventoryItem?.quantity}
                                    </div>
                                );
                            }
                        )}
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
