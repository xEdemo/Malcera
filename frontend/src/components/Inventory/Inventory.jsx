import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
	useUpdateInventoryOnDropMutation,
	useCombineStackMutation,
} from "../../slices/inventory/inventoryApiSlice.js";
import debounce from "lodash.debounce";
import {
	InventoryContextMenu,
	useInventoryContextMenu,
} from "../../components";
import itemImages from "../../utils/itemImages.js";

const inventoryRows = 8;
const inventoryColumns = 5;
const inventorySlots = inventoryRows * inventoryColumns;

const Inventory = ({ inventoryState, rerenderInventory, dispatchInventory, scrollTop, rerenderCharacter }) => {
	const sidebarState = JSON.parse(localStorage.getItem("SIDEBAR_STATE"));

	const inventoryItems = inventoryState.inventoryItems;
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

	const inventoryContainerRef = useRef(null);

	const [onDrop] = useUpdateInventoryOnDropMutation();
	const [combineStack] = useCombineStackMutation();

	const { contextMenu, showContextMenu } = useInventoryContextMenu();
	const [contextMenuItemName, setContextMenuItemName] = useState("");
	const [checkStackable, setCheckStackable] = useState(false);
	const [checkEquippable, setCheckEquippable] = useState(false);
	const [checkQuantity, setCheckQuantity] = useState(0);
	const [checkIndex, setCheckIndex] = useState(null);

	const navigate = useNavigate();
	const dispatch = useDispatch();

	const handleDragStart = (index, e) => {
		e.dataTransfer.effectAllowed = "move";
        setDraggedItemIndex(index);
	};

	const handleDragOver = (index, e) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

	const handleDragEnd = (e) => {
        setDragOverIndex(null);
    };

	const handleDrop = async (index, e) => {
        e.preventDefault();

        if (draggedItemIndex === null) return;

        const updatedItems = [...inventoryItems];
        const draggedItem = updatedItems[draggedItemIndex];
        const targetItem = updatedItems[index];

        updatedItems[draggedItemIndex] = targetItem;
        updatedItems[index] = draggedItem;

        if (draggedItem.stackable && targetItem.stackable && draggedItem.name === targetItem.name) {
            const res = await combineStack({
                emptySlotIndex: draggedItemIndex,
                combinedIndex: index,
            }).unwrap();

            if (res.updatedInventory && res.updatedInventory.slots) {
                dispatchInventory({
                    type: "SET_INVENTORY_ITEMS",
                    payload: res.updatedInventory.slots,
                });
            }
        } else {
            const res = await onDrop({
                changedIndices: [draggedItemIndex, index],
                updatedItems,
            }).unwrap();

            if (res.updatedInventory && res.updatedInventory.slots) {
                dispatchInventory({
                    type: "SET_INVENTORY_ITEMS",
                    payload: res.updatedInventory.slots,
                });
            }
        }

        setDraggedItemIndex(null);
        setDragOverIndex(null);
    };

	useEffect(() => {
		if (!contextMenu.show) {
			// setContextMenuItemName('');
			setCheckStackable(false);
		}
	}, [contextMenu.show]);

	useEffect(() => {
		if (contextMenu.index !== undefined) {
			const itemName = inventoryItems[contextMenu.index]?.name;
			const isStackable = inventoryItems[contextMenu.index]?.stackable;
			const isEquippable = inventoryItems[contextMenu.index]?.equippable;
			const stackQuantity = inventoryItems[contextMenu.index]?.quantity;
			const itemIndex = contextMenu.index;

			const checkForEmptySlot = inventoryItems.some(
				(item) => item.name === "Empty Slot"
			);

			if (itemName) {
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
			if (isEquippable) {
				setCheckEquippable(isEquippable);
			} else {
				setCheckEquippable(false);
			}
			if (itemIndex !== null) {
				setCheckIndex(itemIndex);
			}
		}
	}, [contextMenu]);

	return (
		<>
			<InventoryContextMenu
				contextMenu={contextMenu}
				itemName={contextMenuItemName}
				splitStackableItem={checkStackable}
				checkEquippable={checkEquippable}
				checkOriginalQuantity={checkQuantity}
				index={checkIndex}
				scrollY={scrollTop}
				rerenderInventory={rerenderInventory}
				rerenderCharacter={rerenderCharacter}
			/>
			<div
				className={`inventory-container ${
					sidebarState.isInventoryOpen ? "open" : ""
				}`}
				ref={inventoryContainerRef}
			>
				{inventoryItems.map((inventoryItem, index) => (
					<React.Fragment key={index}>
						<div 
							className={`inventory-slot ${
                            dragOverIndex === index ? "drag-over" : ""
                        	}`}
							onDragOver={(e) => handleDragOver(index, e)}
                        	onDrop={(e) => handleDrop(index, e)}
							onDragEnd={(e) => handleDragEnd(e)}
						>
							{inventoryItem?.name !== "Empty Slot" && (
								<>
									<img
										src={itemImages[inventoryItem?.name]}
										alt={inventoryItem?.name}
										title={inventoryItem?.description}
										onDragStart={(e) => handleDragStart(index, e)}
										draggable
										onContextMenu={(e) =>
											showContextMenu(index, e)
										}
									/>
									{inventoryItem?.stackable && (
										<b className="inventory-quantity">
											{inventoryItem?.quantity}
										</b>
									)}
								</>
							)}
						</div>
					</React.Fragment>
				))}
			</div>
		</>
	);
};

export default Inventory;
