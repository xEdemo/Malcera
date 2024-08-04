import { memo, useState, useEffect, useRef } from "react";
import {
	useSplitStackMutation,
	useRemoveItemMutation,
} from "../../slices/inventory/inventoryApiSlice.js";
import { useUpdateCharacterOnEquipMutation } from "../../slices/character/characterApiSlice.js";
import { toast } from "react-toastify";

const InventoryContextMenu = ({
	contextMenu,
	itemName,
	splitStackableItem,
	checkEquippable,
	checkOriginalQuantity,
	index,
	scrollY,
	rerenderInventory,
	rerenderCharacter,
}) => {
	const { x, y } = contextMenu;

	const initialY = useRef(y);
    const initialScrollY = useRef(scrollY);

	const [splitAmount, setSplitAmount] = useState(1);
	const [isSplitting, setIsSplitting] = useState(false);
	const [splitStack] = useSplitStackMutation();

	const [isRemoving, setIsRemoving] = useState(false);
	const [removeItem] = useRemoveItemMutation();

	const [equipItem] = useUpdateCharacterOnEquipMutation();

	const handleSplitStack = async () => {
		try {
			const res = await splitStack({
				index: index,
				amount: splitAmount,
			});
			if (res.data) {
				rerenderInventory();
			}
			if (res.error && res.error.data && res.error.data.message) {
				toast.error(res.error.data.message);
			}
		} catch (err) {
			toast.error("Error splitting stack.");
		} finally {
			setIsSplitting(false);
		}
	};

	const handleRemoveItem = async () => {
		try {
			const res = await removeItem({
				index: index,
			});
			if (res.data) {
				rerenderInventory();
			}
			if (res.error && res.error.data && res.error.data.message) {
				toast.error(res.error.data.message);
			}
		} catch (err) {
			toast.error("Error deleting an item.");
		} finally {
			setIsRemoving(false);
		}
	};

	const handleEquipItem = async () => {
		try {
			const res = await equipItem({
				index: index,
			});
			if (res.data) {
				rerenderInventory();
				rerenderCharacter();
			}
			if (res.error && res.error.data && res.error.data.message) {
				toast.error(res.error.data.message);
			}
		} catch (error) {
			toast.error("Error equipping an item.");
		}
	};

	const handleSliderChange = (e) => {
		setSplitAmount(Number(e.target.value));
	};

	const handleInputChange = (e) => {
		const value = Number(e.target.value);
		if (
			value === "" ||
			(!isNaN(value) && value >= 0 && value <= checkOriginalQuantity)
		) {
			setSplitAmount(value === "" ? 1 : Number(value));
		}
    };  

	useEffect(() => {
		setSplitAmount(Math.floor(checkOriginalQuantity / 2));
	}, [checkOriginalQuantity]);

	useEffect(() => {
        if (contextMenu.show) {
            initialY.current = y;
            initialScrollY.current = scrollY;
        }
    }, [contextMenu.show, y]);

	return (
		<>
			{contextMenu.show && (
				<div
					className="context-menu-main"
					style={{
						top: `${initialY.current - (scrollY - initialScrollY.current)}px`,
						left: `${x}px`,
					}}
				>
					{itemName && <p>{itemName}</p>}
					{checkEquippable && <p onClick={handleEquipItem}>Equip</p>}
					{splitStackableItem && checkOriginalQuantity > 1 && (
						<p onClick={() => setIsSplitting(true)}>Split</p>
					)}
					{itemName && (
						<p onClick={() => setIsRemoving(true)}>Delete</p>
					)}
				</div>
			)}
			{isSplitting && !isRemoving && (
				<>
					<div
						className={`left-sidebar-content-container ${
							isSplitting ? "splitting" : ""
						}`}
					>
						<div
							className={`inventory-container ${
								isSplitting ? "splitting" : ""
							}`}
						>
							<div className="split-context-menu">
								<div className="range ltpurple split-range">
									<input
										type="range"
										id="splitAmount"
										name="splitAmount"
										min={1}
										max={checkOriginalQuantity}
										value={
											splitAmount === 0 ? "" : splitAmount
										}
										onChange={handleSliderChange}
									/>
								</div>
								<label htmlFor="splitAmount">
									<input
										type="number"
										min={1}
										max={checkOriginalQuantity}
										step={1}
										value={
											splitAmount === 0 ? "" : splitAmount
										}
										onChange={handleInputChange}
									/>{" "}
									/ {checkOriginalQuantity}
								</label>
								<button
									className="close-btn-split"
									onClick={() => setIsSplitting(false)}
								>
									Close
								</button>
								<button
									className="confirm-btn-split"
									onClick={handleSplitStack}
								>
									Confirm
								</button>
							</div>
						</div>
					</div>
				</>
			)}
			{isRemoving && !isSplitting && (
				<div
					className={`left-sidebar-content-container ${
						isRemoving ? "deleting" : ""
					}`}
				>
					<div
						className={`inventory-container ${
							isRemoving ? "deleting" : ""
						}`}
					>
						<div className="delete-context-menu">
							<p>
								Are you sure you want to delete the item 
								'{itemName}'?
							</p>
							<button
								className="close-btn-delete"
								onClick={() => setIsRemoving(false)}
							>
								Close
							</button>
							<button
								className="confirm-btn-delete"
								onClick={handleRemoveItem}
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default memo(InventoryContextMenu);

// How to use:
// import { ContextMenu, useContextMenu } from '../../components'
// const { contextMenu, showContextMenu } = useContextMenu();
// Put <ContextMenu contextMenu={contextMenu} /> anywhere within return
// Put onContextMenu={showContextMenu} on any element that you want custom right click functionality for
