import { memo, useState, useEffect, useReducer } from 'react';
import {
    useSplitStackMutation,
    useRemoveItemMutation,
} from '../../slices/inventory/inventoryApiSlice.js';
import { toast } from 'react-toastify';

const ContextMenu = ({
    contextMenu,
    itemName,
    splitStackableItem,
    checkOriginalQuantity,
    index,
    rerenderInventory,
}) => {
    const [splitAmount, setSplitAmount] = useState(1);
    const [isSplitting, setIsSplitting] = useState(false);
    const [splitStack] = useSplitStackMutation();

    const [removeItem] = useRemoveItemMutation();

    const handleSplitStack = async () => {
        try {
            const res = await splitStack({
                index: index,
                amount: splitAmount,
            });
            console.log(res);
            if (res.data) {
                rerenderInventory();
            }
            if (res.error && res.error.data && res.error.data.message) {
                toast.error(res.error.data.message);
            }
        } catch (err) {
            toast.error('Error splitting stack.');
        } finally {
            // Reset the state after the split is complete
            setIsSplitting(false);
        }
    };

    const handleRemoveItem = async () => {
        try {
            const res = await removeItem({
                index: index
            });
            if (res.data) {
                rerenderInventory();
            }
            if (res.error && res.error.data && res.error.data.message) {
                toast.error(res.error.data.message);
            }
        } catch (err) {
            toast.error('Error deleting an item.');
        }
    };

    const handleSliderChange = (e) => {
        setSplitAmount(Number(e.target.value));
    };

    const handleInputChange = (e) => {
        const value = Number(e.target.value);
        if (
            value === '' ||
            (!isNaN(value) && value >= 0 && value <= checkOriginalQuantity)
        ) {
            setSplitAmount(value === '' ? 1 : Number(value));
        }
    };

    // useEffect(() => {
    //     if (isSplitting) {

    //     }
    // }, [isSplitting]);

    useEffect(() => {
        setSplitAmount(Math.floor(checkOriginalQuantity / 2));
    }, [checkOriginalQuantity]);

    return (
        <>
            {contextMenu.show && (
                <div
                    className={`context-menu-main ${
                        splitStackableItem ? 'stackable' : ''
                    } ${checkOriginalQuantity > 1 ? '' : 'non-splitable'}`}
                    style={{
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                    }}
                >
                    {itemName && (
                        <p className="item-name-context-menu">{itemName}</p>
                    )}
                    <p>Context Menu</p>
                    {splitStackableItem && checkOriginalQuantity > 1 && (
                        <p onClick={() => setIsSplitting(true)}>Split</p>
                    )}
                    {itemName && (
                        <p style={{ color: 'red' }} onClick={handleRemoveItem}>
                            Delete
                        </p>
                    )}
                </div>
            )}
            {isSplitting && (
                <div className="split-context-menu">
                    <label htmlFor="splitAmount">
                        Split Amount:{' '}
                        <input
                            type="number"
                            min={1}
                            max={checkOriginalQuantity}
                            step={1}
                            value={splitAmount === 0 ? '' : splitAmount}
                            onChange={handleInputChange}
                        />
                    </label>
                    <input
                        type="range"
                        id="splitAmount"
                        name="splitAmount"
                        min={1}
                        max={checkOriginalQuantity} // Adjust the max value based on your requirements
                        value={splitAmount === 0 ? '' : splitAmount}
                        onChange={handleSliderChange}
                    />
                    <button onClick={() => setIsSplitting(false)}>Close</button>
                    <button onClick={handleSplitStack}>Confirm</button>
                </div>
            )}
        </>
    );
};

export default memo(ContextMenu);

// How to use:
// import { ContextMenu, useContextMenu } from '../../components'
// const { contextMenu, showContextMenu } = useContextMenu();
// Put <ContextMenu contextMenu={contextMenu} /> anywhere within return
// Put onContextMenu={showContextMenu} on any element that you want custom right click functionality for
